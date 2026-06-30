/**
 * Excel Data Loading Module for Dashboard
 * Fetches Excel data from Cloudflare Worker and exposes it for Chart.js
 * 
 * Usage:
 *   const excelData = await ExcelDataLoader.load();
 *   const sheetData = excelData['Sheet1']; // Array of objects
 */

const ExcelDataLoader = {
    CURRENT_FISCAL_URL: 'https://comptroller.texas.gov/transparency/revenue/watch/all-funds/',
    CURRENT_FISCAL_PROXY_URL: 'https://api.allorigins.win/get?url=',
    BUNDLED_CURRENT_FISCAL_URL: 'data/current-fiscal-year-tax-collections.json',
    LIVE_OVERLAY_TIMEOUT_MS: 5000,
    FISCAL_MONTH_ORDER: [
        'September', 'October', 'November', 'December',
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August'
    ],

    // Configure endpoint via meta tag, app config, or fallback
    ENDPOINT: (() => {
        const meta = document.querySelector('meta[name="excel-data-endpoint"]');
        const metaValue = meta?.getAttribute('content')?.trim();
        const appConfigEndpoint = window.APP_CONFIG?.excelDataEndpoint
            ? String(window.APP_CONFIG.excelDataEndpoint).trim()
            : '';
        const useRemoteOnLocalhost = meta?.getAttribute('data-use-remote-on-localhost') === 'true'
            || window.APP_CONFIG?.useRemoteExcelEndpointOnLocalhost === true;
        const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

        if (isLocalhost && !useRemoteOnLocalhost) {
            return '/api/excel-data';
        }

        if (appConfigEndpoint) {
            return appConfigEndpoint;
        }

        if (metaValue) {
            return metaValue;
        }

        return 'https://fred-proxy.hibbsdashboard.workers.dev/api/excel-data';
    })(),
    // Alternative for local testing:
    // ENDPOINT: '/api/excel-data',

    cache: null,
    cacheTime: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    /**
     * Load all Excel sheets as JSON
     * @returns {Promise<Object>} Object with sheet names as keys and data arrays as values
     */
    async load() {
        const now = Date.now();

        // Return cached data if fresh
        if (this.cache && this.cacheTime && (now - this.cacheTime) < this.CACHE_DURATION) {
            console.log('[ExcelDataLoader] Using cached data');
            return this.cache;
        }

        try {
            console.log('[ExcelDataLoader] Fetching from', this.ENDPOINT);
            const response = await fetch(this.ENDPOINT, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const excelSource = response.headers.get('X-Excel-Source') || '';
            let data = await response.json();

            // Validate response format
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }

            data = await this.overlayCurrentFiscalYear(data, { excelSource });

            // Cache the data
            this.cache = data;
            this.cacheTime = now;

            console.log('[ExcelDataLoader] Loaded sheets:', Object.keys(data));
            Object.entries(data).forEach(([sheetName, rows]) => {
                console.log(`  ${sheetName}: ${Array.isArray(rows) ? rows.length : 0} rows`);
            });

            return data;
        } catch (error) {
            console.error('[ExcelDataLoader] Failed to load:', error.message);
            throw error;
        }
    },

    async overlayCurrentFiscalYear(data, options = {}) {
        let overlaySheet = null;
        const excelSource = String(options.excelSource || '');
        const workerAlreadyHasLiveOverlay = excelSource.includes('live-current-fy');

        if (!workerAlreadyHasLiveOverlay) {
            try {
                if (typeof DOMParser === 'undefined') {
                    throw new Error('DOMParser is unavailable in this environment');
                }

                overlaySheet = await this.fetchCurrentFiscalYearSheet();
            } catch (error) {
                console.warn('[ExcelDataLoader] Live fiscal year overlay failed:', error.message || error);
            }
        } else {
            console.log('[ExcelDataLoader] Skipping browser overlay because worker already returned live current-fiscal data');
        }

        if (!overlaySheet) {
            try {
                overlaySheet = await this.fetchBundledCurrentFiscalYearSheet();
                console.log(`[ExcelDataLoader] Using bundled ${overlaySheet.sheetName} overlay`);
            } catch (error) {
                console.warn('[ExcelDataLoader] Bundled fiscal year overlay failed:', error.message || error);
            }
        }

        if (overlaySheet?.sheetName && Array.isArray(overlaySheet.rows)) {
            const existingRows = data[overlaySheet.sheetName];

            if (this.shouldReplaceFiscalSheet(existingRows, overlaySheet.rows)) {
                data[overlaySheet.sheetName] = overlaySheet.rows;
                console.log(`[ExcelDataLoader] Overlaid ${overlaySheet.sheetName}`);
            } else {
                console.log(`[ExcelDataLoader] Kept existing ${overlaySheet.sheetName}; overlay was not newer than API data`);
            }
        }

        return data;
    },

    async fetchCurrentFiscalYearSheet() {
        const proxyUrl = `${this.CURRENT_FISCAL_PROXY_URL}${encodeURIComponent(this.CURRENT_FISCAL_URL)}`;
        const response = await this.fetchWithTimeout(proxyUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        }, this.LIVE_OVERLAY_TIMEOUT_MS);

        if (!response.ok) {
            throw new Error(`Live revenue page proxy failed with HTTP ${response.status}`);
        }

        const payload = await response.json();
        const html = typeof payload?.contents === 'string' ? payload.contents : '';
        if (!html) {
            throw new Error('Live revenue page proxy returned no HTML contents');
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return this.buildCurrentFiscalYearSheet(doc, html);
    },

    async fetchBundledCurrentFiscalYearSheet() {
        const bundledUrl = new URL(this.BUNDLED_CURRENT_FISCAL_URL, window.location.href).toString();
        const response = await fetch(bundledUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Bundled fiscal year overlay failed with HTTP ${response.status}`);
        }

        const payload = await response.json();
        if (!payload?.sheetName || !Array.isArray(payload.rows)) {
            throw new Error('Bundled fiscal year overlay is missing sheet data');
        }

        return payload;
    },

    buildCurrentFiscalYearSheet(doc, html) {
        const taxTable = Array.from(doc.querySelectorAll('table')).find((table) => {
            const firstHeader = this.getCellText(table.querySelector('thead th'));
            return firstHeader === 'Tax Collections by Major Tax';
        });

        if (!taxTable) {
            throw new Error('Tax collections table not found on live revenue page');
        }

        const fiscalYear = this.extractFiscalYear(html, taxTable);
        const sheetKey = `Historical All Funds (Excluding Trusts) Revenue Fiscal ${fiscalYear}`;
        const headerCells = Array.from(taxTable.querySelectorAll('thead th')).map((cell) => this.getCellText(cell));
        const totalHeaderIndex = headerCells.findIndex((text) => text.toLowerCase() === 'total');
        const monthCount = totalHeaderIndex > 1
            ? Math.min(this.FISCAL_MONTH_ORDER.length, totalHeaderIndex - 1)
            : this.FISCAL_MONTH_ORDER.length;

        const rows = [];
        rows.push({ [sheetKey]: 'Tax Collections' });

        const headerRow = { [sheetKey]: 'Tax Category' };
        this.FISCAL_MONTH_ORDER.forEach((month, index) => {
            headerRow[this.getSheetColumnKey(index)] = month;
        });
        headerRow.__EMPTY_12 = 'Total';
        headerRow.__EMPTY_13 = 'CRE Fiscal Year Estimate';
        rows.push(headerRow);

        Array.from(taxTable.querySelectorAll('tr')).slice(1).forEach((tr) => {
            const rowHeader = tr.querySelector('th');
            const label = this.normalizeCategoryLabel(this.getCellText(rowHeader));
            if (!label || label === 'Percentage Change') {
                return;
            }

            const cells = Array.from(tr.querySelectorAll('th, td')).map((cell) => this.getCellText(cell));
            const row = { [sheetKey]: label };

            this.FISCAL_MONTH_ORDER.forEach((_, index) => {
                row[this.getSheetColumnKey(index)] = index < monthCount
                    ? this.coerceNumber(cells[index + 1])
                    : 0;
            });

            row.__EMPTY_12 = this.coerceNumber(cells[monthCount + 1]);
            row.__EMPTY_13 = this.coerceNumber(cells[monthCount + 3]);
            rows.push(row);
        });

        return {
            sheetName: `FY ${fiscalYear}`,
            rows
        };
    },

    shouldReplaceFiscalSheet(existingRows, candidateRows) {
        if (!Array.isArray(candidateRows) || candidateRows.length === 0) {
            return false;
        }

        if (!Array.isArray(existingRows) || existingRows.length === 0) {
            return true;
        }

        const existingSummary = this.getFiscalSheetSummary(existingRows);
        const candidateSummary = this.getFiscalSheetSummary(candidateRows);

        if (candidateSummary.lastReportedMonthIndex !== existingSummary.lastReportedMonthIndex) {
            return candidateSummary.lastReportedMonthIndex > existingSummary.lastReportedMonthIndex;
        }

        return candidateSummary.populatedCellCount > existingSummary.populatedCellCount;
    },

    getFiscalSheetSummary(rows) {
        const headerRow = rows.find((row) => {
            const firstValue = Object.values(row || {})[0];
            return this.getCellText({ textContent: firstValue }).includes('Tax Category');
        });

        const monthKeyMap = new Map();
        if (headerRow) {
            Object.entries(headerRow).forEach(([key, value]) => {
                const label = this.getCellText({ textContent: value });
                if (this.FISCAL_MONTH_ORDER.includes(label)) {
                    monthKeyMap.set(label, key);
                }
            });
        }

        let lastReportedMonthIndex = -1;
        let populatedCellCount = 0;

        rows.forEach((row) => {
            const label = this.getCellText({ textContent: Object.values(row || {})[0] });
            if (!label || label === 'Tax Collections' || label === 'Tax Category') return;

            this.FISCAL_MONTH_ORDER.forEach((month, index) => {
                const key = monthKeyMap.get(month);
                if (!key) return;

                if (this.coerceNumber(row[key]) !== 0) {
                    lastReportedMonthIndex = Math.max(lastReportedMonthIndex, index);
                    populatedCellCount += 1;
                }
            });
        });

        return {
            lastReportedMonthIndex,
            populatedCellCount
        };
    },

    async fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
        if (typeof AbortController === 'undefined') {
            return fetch(url, options);
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fetch(url, {
                ...options,
                signal: controller.signal
            });
        } catch (error) {
            if (error?.name === 'AbortError') {
                throw new Error(`Request timed out after ${timeoutMs}ms`);
            }

            throw error;
        } finally {
            clearTimeout(timer);
        }
    },

    extractFiscalYear(html, taxTable) {
        const directMatch = html.match(/Fiscal\s+(\d{4})/i);
        if (directMatch) {
            return directMatch[1];
        }

        const yearMatches = Array.from(taxTable.querySelectorAll('thead th'))
            .map((cell) => this.getCellText(cell).match(/\b(20\d{2})\b/))
            .filter(Boolean)
            .map((match) => Number(match[1]));

        if (yearMatches.length > 0) {
            return String(Math.max(...yearMatches));
        }

        throw new Error('Could not determine fiscal year from live revenue page');
    },

    getSheetColumnKey(index) {
        return index === 0 ? '__EMPTY' : `__EMPTY_${index}`;
    },

    getCellText(cell) {
        if (!cell) return '';
        return String(cell.textContent || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    normalizeCategoryLabel(label) {
        return label.replace(/\d+$/u, '').trim();
    },

    coerceNumber(value) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        const cleaned = String(value || '')
            .replace(/,/g, '')
            .replace(/\$/g, '')
            .replace(/%/g, '')
            .trim();

        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    },

    /**
     * Get data from a specific sheet
     * @param {string} sheetName - Name of the sheet to retrieve
     * @returns {Promise<Array>} Array of objects from the sheet
     */
    async getSheet(sheetName) {
        const data = await this.load();
        if (!data[sheetName]) {
            throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${Object.keys(data).join(', ')}`);
        }
        return data[sheetName];
    },

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache = null;
        this.cacheTime = null;
    }
};

// =============================================================================
// Integration Example with Chart.js
// =============================================================================

/**
 * Example: Load Excel data and populate Chart.js charts
 */
async function loadExcelDataToCharts() {
    try {
        const excelData = await ExcelDataLoader.load();

        // Example: If your Excel has a "Sales" sheet with Date and Amount columns
        if (excelData.Sales) {
            const salesData = excelData.Sales;
            const labels = salesData.map(row => row.Date);
            const values = salesData.map(row => parseFloat(row.Amount) || 0);

            // Update your Chart.js chart
            if (window.salesChart) {
                window.salesChart.data.labels = labels;
                window.salesChart.data.datasets[0].data = values;
                window.salesChart.update();
            }
        }

        // Example: If your Excel has an "Metrics" sheet
        if (excelData.Metrics) {
            console.log('Metrics data:', excelData.Metrics);
            // Use excelData.Metrics to populate other charts
        }

    } catch (error) {
        console.error('Failed to load Excel data:', error);
        // Fallback: Use sample data or show error to user
    }
}

/**
 * Example: Load specific sheet and create a new chart
 */
async function createChartFromExcelSheet(sheetName, canvasId, chartConfig = {}) {
    try {
        const sheetData = await ExcelDataLoader.getSheet(sheetName);

        // Assumes Excel has 'Date' and 'Value' columns
        const labels = sheetData.map(row => row.Date || row.date || row.Label);
        const values = sheetData.map(row => parseFloat(row.Value || row.value) || 0);

        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) {
            throw new Error(`Canvas element not found: ${canvasId}`);
        }

        const defaultConfig = {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: sheetName,
                    data: values,
                    borderColor: '#CB6015',
                    backgroundColor: 'rgba(203, 96, 21, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: sheetName }
                }
            }
        };

        const finalConfig = { ...defaultConfig, ...chartConfig };
        return new Chart(ctx, finalConfig);

    } catch (error) {
        console.error(`Failed to create chart from sheet ${sheetName}:`, error);
        throw error;
    }
}

// =============================================================================
// Quick Integration Snippet
// =============================================================================

// Add this to your page initialization:
/*
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const excelData = await ExcelDataLoader.load();
        // Now use excelData to populate your charts
        console.log('Excel sheets available:', Object.keys(excelData));
    } catch (error) {
        console.error('Excel loading failed:', error);
    }
});
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExcelDataLoader, loadExcelDataToCharts, createChartFromExcelSheet };
}
