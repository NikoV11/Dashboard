/**
 * Excel Data Loading Module for Dashboard
 * Fetches Excel data from Cloudflare Worker and exposes it for Chart.js
 * 
 * Usage:
 *   const excelData = await ExcelDataLoader.load();
 *   const sheetData = excelData['Sheet1']; // Array of objects
 */

const ExcelDataLoader = {
    // Configure your Worker endpoint here
    ENDPOINT: 'https://fred-proxy.hibbsdashboard.workers.dev/api/excel-data',
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

            const data = await response.json();

            // Validate response format
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }

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
