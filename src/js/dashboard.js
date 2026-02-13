const GDP_ID = 'A191RL1Q225SBEA';
const CPI_ID = 'CPIAUCSL';
const UNEMPLOYMENT_ID = 'UNRATE';
const TEXAS_UNEMPLOYMENT_ID = 'TXUR';
const TYLER_UNEMPLOYMENT_ID = 'TYLE348UR';
const PAYEMS_ID = 'PAYEMS';
const MEDIAN_PRICE_ID = 'MEDLISPRIMM46340';
const MORTGAGE30_ID = 'MORTGAGE30US';
const MORTGAGE15_ID = 'MORTGAGE15US';
const TYLER_PAYROLL_ID = 'TYLSA158MFRBDAL';
const TEXAS_PAYROLL_ID = 'TX0000000M175FRBDAL';
const FRED_PROXY_BASE = (() => {
    const meta = document.querySelector('meta[name="fred-proxy-base"]');
    const metaValue = meta?.getAttribute('content')?.trim();

    if (metaValue) {
        return metaValue;
    }

    if (window.APP_CONFIG?.fredProxyBase) {
        return String(window.APP_CONFIG.fredProxyBase).trim();
    }

    return '';
})();

const FRED_URL = FRED_PROXY_BASE
    ? `${FRED_PROXY_BASE.replace(/\/$/, '')}/fred/series/observations`
    : '/api/fred/series/observations';

const SAMPLE_DATA = {
    gdp: [
        { date: '2023-01-01', value: 2.2 },
        { date: '2023-04-01', value: 2.1 },
        { date: '2023-07-01', value: 4.9 },
        { date: '2023-10-01', value: 3.5 },
        { date: '2024-01-01', value: 1.4 },
        { date: '2024-04-01', value: 3.6 },
        { date: '2024-07-01', value: 3.3 },
        { date: '2024-10-01', value: 1.9 },
        { date: '2025-01-01', value: -0.6 },
        { date: '2025-04-01', value: 3.8 }
    ],
    cpi: [
        { date: '2024-01-01', value: 0.3 },
        { date: '2024-02-01', value: 0.4 },
        { date: '2024-03-01', value: 0.3 },
        { date: '2024-04-01', value: 0.2 },
        { date: '2024-05-01', value: 0.1 },
        { date: '2024-06-01', value: 0.2 },
        { date: '2024-07-01', value: 0.2 },
        { date: '2024-08-01', value: 0.2 },
        { date: '2024-09-01', value: 0.2 },
        { date: '2024-10-01', value: 0.3 },
        { date: '2024-11-01', value: 0.3 },
        { date: '2024-12-01', value: 0.4 },
        { date: '2025-01-01', value: 0.3 },
        { date: '2025-02-01', value: 0.2 },
        { date: '2025-03-01', value: 0.3 },
        { date: '2025-04-01', value: 0.2 },
        { date: '2025-05-01', value: 0.3 },
        { date: '2025-06-01', value: 0.2 },
        { date: '2025-07-01', value: 0.2 },
        { date: '2025-08-01', value: 0.3 },
        { date: '2025-09-01', value: 0.2 }
    ],
    unemployment: [
        { date: '2023-01-01', value: 3.4 },
        { date: '2023-02-01', value: 3.6 },
        { date: '2023-03-01', value: 3.5 },
        { date: '2023-04-01', value: 3.4 },
        { date: '2023-05-01', value: 3.7 },
        { date: '2023-06-01', value: 3.6 },
        { date: '2023-07-01', value: 3.5 },
        { date: '2023-08-01', value: 3.8 },
        { date: '2023-09-01', value: 3.8 },
        { date: '2023-10-01', value: 3.9 },
        { date: '2023-11-01', value: 3.7 },
        { date: '2023-12-01', value: 3.7 },
        { date: '2024-01-01', value: 3.7 },
        { date: '2024-02-01', value: 3.9 },
        { date: '2024-03-01', value: 3.8 },
        { date: '2024-04-01', value: 3.9 },
        { date: '2024-05-01', value: 4.0 },
        { date: '2024-06-01', value: 4.0 },
        { date: '2024-07-01', value: 4.3 },
        { date: '2024-08-01', value: 4.2 },
        { date: '2024-09-01', value: 4.1 },
        { date: '2024-10-01', value: 4.1 },
        { date: '2024-11-01', value: 4.2 },
        { date: '2025-01-01', value: 4.0 },
        { date: '2025-02-01', value: 4.1 },
        { date: '2025-03-01', value: 4.2 },
        { date: '2025-04-01', value: 3.9 },
        { date: '2025-05-01', value: 4.0 }
    ]
};

let gdpChart = null;
let cpiChart = null;
let unemploymentChart = null;
let payemsChart = null;
let employmentChart = null;
let salesTaxChart = null;
let medianPriceChart = null;
let mortgage30Chart = null;
let mortgage15Chart = null;
let cachedData = null;
let salesTaxData = [];
let medianPriceData = [];
let mortgageData = [];
let employmentData = [];
let dataSource = 'sample';
let salesTaxLoaded = false;
let medianPriceLoaded = false;
let mortgageLoaded = false;
let employmentLoaded = false;

// NBER Recession Periods (Peak to Trough)
const RECESSION_PERIODS = [
    { start: '2001-03-01', end: '2001-11-01' },
    { start: '2007-12-01', end: '2009-06-01' },
    { start: '2020-02-01', end: '2020-04-01' }
];

// ========== Utility Functions ==========

// Create recession period boxes for charts (returns array for custom plugin)
function getRecessionAnnotations(dataLabels, isQuarterly = false) {
    if (!dataLabels || dataLabels.length === 0) return [];
    
    const periods = [];
    
    RECESSION_PERIODS.forEach((period, index) => {
        const startDate = parseLocalDate(period.start);
        const endDate = parseLocalDate(period.end);
        
        // Find the indices where recession starts and ends in the data
        let xMin = null;
        let xMax = null;
        
        dataLabels.forEach((label, idx) => {
            // Parse label back to date for comparison
            let labelDate;
            if (isQuarterly) {
                // Format: "Q1 2020"
                const match = label.match(/Q(\d) (\d{4})/);
                if (match) {
                    const quarter = parseInt(match[1]);
                    const year = parseInt(match[2]);
                    const month = (quarter - 1) * 3;
                    labelDate = new Date(Date.UTC(year, month, 1));
                }
            } else {
                // Format: "Jan 2020" - parse from locale string
                labelDate = new Date(label + ' 2020'); // Add year as fallback
                if (isNaN(labelDate.getTime())) {
                    // Try parsing as a full date string
                    const parts = label.split(' ');
                    if (parts.length === 2) {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthIdx = monthNames.indexOf(parts[0]);
                        if (monthIdx >= 0) {
                            const year = parseInt(parts[1]);
                            labelDate = new Date(Date.UTC(year, monthIdx, 1));
                        }
                    }
                }
            }
            
            if (labelDate && labelDate >= startDate && xMin === null) {
                xMin = idx - 0.5;
            }
            if (labelDate && labelDate <= endDate) {
                xMax = idx + 0.5;
            }
        });
        
        if (xMin !== null && xMax !== null && xMax >= xMin) {
            periods.push({
                xMin: xMin,
                xMax: xMax
            });
        }
    });
    
    return periods;
}

// Validate that required data files are loaded
function validateDataSources() {
    const missing = [];
    if (typeof REVENUE_DATA === 'undefined') missing.push('revenue-data.js');
    
    if (missing.length > 0) {
        setStatus(`Error: Missing data files - ${missing.join(', ')}`, 'error');
        console.error('Missing required data files:', missing);
        return false;
    }
    return true;
}

// Validate year range inputs
function validateYearRange(startYear, endYear) {
    const currentYear = new Date().getFullYear();
    
    if (isNaN(startYear) || isNaN(endYear)) {
        alert('Please enter valid years');
        return false;
    }
    
    if (startYear > endYear) {
        alert('Start date must be before or equal to end date');
        return false;
    }
    
    if (startYear < 1947) {
        alert('FRED data is not available before 1947. Please enter a start year of 1947 or later.');
        return false;
    }
    
    if (endYear > currentYear + 5) {
        alert(`Please enter an end year no later than ${currentYear + 5}`);
        return false;
    }
    
    return true;
}

// Helper function to get date range from inputs
function getDateRange() {
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    const fullHistoryToggle = document.getElementById('fullHistoryToggle');
    
    // Debug logging
    console.log('[getDateRange] fullHistoryToggle exists?', !!fullHistoryToggle);
    if (fullHistoryToggle) {
        console.log('[getDateRange] fullHistoryToggle.checked:', fullHistoryToggle.checked);
    }
    
    // Month inputs return YYYY-MM format
    // If full history is checked, use 1947 (earliest FRED data), otherwise use user value or default 2023
    const startValue = fullHistoryToggle?.checked ? '1947-01' : (startDateEl?.value || '2023-01');
    const endValue = endDateEl?.value || '2026-01';
    
    console.log('[getDateRange] startValue:', startValue, 'endValue:', endValue);
    
    const [startYear, startMonth] = startValue.split('-').map(Number);
    const [endYear, endMonth] = endValue.split('-').map(Number);
    
    // Start date: first day of the month at midnight
    const startDate = new Date(startYear, startMonth - 1, 1, 0, 0, 0, 0);
    
    // End date: last day of the month at end of day
    const endDate = new Date(endYear, endMonth, 0, 23, 59, 59, 999);
    
    // Return object with isFullHistory flag
    return { 
        startDate, 
        endDate,
        isFullHistory: fullHistoryToggle?.checked || false
    };
}

// Helper function to check if a date is within range
function isDateInRange(dateStr, startDate, endDate, isQuarterly = false) {
    const date = parseLocalDate(dateStr);
    
    if (isQuarterly) {
        // For quarterly data, check if the quarter overlaps with the date range
        // Get the quarter's start and end months
        const dataMonth = date.getMonth(); // 0-11
        const dataYear = date.getFullYear();
        
        // Determine quarter start and end months
        const quarterStartMonth = Math.floor(dataMonth / 3) * 3;
        const quarterEndMonth = quarterStartMonth + 2;
        
        const quarterStart = new Date(dataYear, quarterStartMonth, 1, 0, 0, 0, 0);
        const quarterEnd = new Date(dataYear, quarterEndMonth + 1, 0, 23, 59, 59, 999);
        
        // Check if quarter overlaps with the selected date range
        return quarterEnd >= startDate && quarterStart <= endDate;
    } else {
        // For monthly data, compare by month/year
        const dateFirstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
        const startFirstOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0);
        const endFirstOfMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1, 0, 0, 0, 0);
        
        return dateFirstOfMonth >= startFirstOfMonth && dateFirstOfMonth <= endFirstOfMonth;
    }
}

// Destroy chart instance safely
function destroyChart(chartInstance) {
    if (chartInstance) {
        try {
            chartInstance.destroy();
        } catch (error) {
            console.warn('Error destroying chart:', error);
        }
    }
}

// Create chart with error handling
function createChartSafely(canvasId, config) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element not found: ${canvasId}`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error(`Could not get 2D context for: ${canvasId}`);
            return null;
        }
        
        return new Chart(ctx, config);
    } catch (error) {
        console.error(`Error creating chart ${canvasId}:`, error);
        setStatus(`Error creating chart: ${error.message}`, 'error');
        return null;
    }
}

// Show loading indicator for lazy-loaded tabs
function showLoadingIndicator(tabId) {
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
        statusEl.textContent = `Loading ${tabId} data...`;
        statusEl.className = 'status muted';
    }
}

function hideLoadingIndicator() {
    const statusEl = document.getElementById('statusText');
    if (statusEl && statusEl.textContent.includes('Loading')) {
        statusEl.textContent = 'Ready';
        statusEl.className = 'status success';
    }
}

function setStatus(text, tone = 'muted') {
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.className = `status ${tone}`;
    }
}

function ensureDefaults() {
    const start = document.getElementById('startDate');
    const end = document.getElementById('endDate');
    if (start && !start.value) start.value = '2023-01';
    if (end && !end.value) end.value = '2026-01';
}

function registerPlugins() {
    if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }
    
    // Register custom recession plugin
    Chart.register({
        id: 'recessionBackground',
        afterDatasetsDraw(chart) {
            if (!chart.options.plugins?.recession?.periods) return;
            
            const ctx = chart.ctx;
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            
            if (!xScale || !yScale) return;
            
            chart.options.plugins.recession.periods.forEach(period => {
                if (period.xMin !== null && period.xMax !== null) {
                    const x0 = xScale.getPixelForValue(period.xMin);
                    const x1 = xScale.getPixelForValue(period.xMax);
                    
                    ctx.save();
                    ctx.fillStyle = 'rgba(156, 163, 175, 0.12)';
                    ctx.fillRect(x0, yScale.top, x1 - x0, yScale.bottom - yScale.top);
                    ctx.restore();
                }
            });
        }
    });
}

// Data cache for resilience
const dataCache = {};
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_VERSION = 'v2';
const STORAGE_PREFIX = 'fredCache';

function formatDateForFRED(date) {
    return date.toISOString().slice(0, 10);
}

function buildCacheKey(seriesId, rangeKey) {
    return `${CACHE_VERSION}:${seriesId}:${rangeKey}`;
}

function getAdaptiveAxisTicks(count) {
    if (!Number.isFinite(count) || count <= 0) {
        return { autoSkip: true, maxTicksLimit: 6, maxRotation: 0, minRotation: 0 };
    }
    if (count <= 6) {
        return { autoSkip: false, maxTicksLimit: count, maxRotation: 0, minRotation: 0 };
    }
    if (count <= 12) {
        return { autoSkip: true, maxTicksLimit: 12, maxRotation: 0, minRotation: 0 };
    }
    if (count <= 24) {
        return { autoSkip: true, maxTicksLimit: 12, maxRotation: 30, minRotation: 0 };
    }
    if (count <= 60) {
        return { autoSkip: true, maxTicksLimit: 10, maxRotation: 45, minRotation: 45 };
    }
    return { autoSkip: true, maxTicksLimit: 8, maxRotation: 60, minRotation: 60 };
}

function getAdaptiveTickFont(count, baseSize = 12) {
    if (!Number.isFinite(count)) return baseSize;
    if (count > 60) return Math.max(9, baseSize - 2);
    if (count > 24) return Math.max(10, baseSize - 1);
    return baseSize;
}

function readLocalCache(key) {
    try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.data)) return null;
        return parsed;
    } catch (error) {
        console.warn('Failed to read local cache:', error);
        return null;
    }
}

function writeLocalCache(key, payload) {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(payload));
    } catch (error) {
        console.warn('Failed to write local cache:', error);
    }
}

function getBufferedRange(range, bufferMonths = 24) {
    if (!range?.startDate || !range?.endDate) return null;
    const bufferedStart = new Date(range.startDate);
    bufferedStart.setMonth(bufferedStart.getMonth() - bufferMonths);
    return { startDate: bufferedStart, endDate: range.endDate };
}

async function withTimeout(promise, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        const response = await promise(controller.signal);
        clearTimeout(timer);
        return response;
    } catch (error) {
        clearTimeout(timer);
        throw error;
    }
}

async function fetchWithRetry(url, maxRetries = 2, timeout = 12000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await withTimeout(signal => fetch(url, { signal }), timeout);
            if (res.ok) return res;
            throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            const isLastAttempt = attempt === maxRetries;
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
            console.log(`[Attempt ${attempt}/${maxRetries}] Failed: ${err.message}${isLastAttempt ? ' (final)' : `, retrying in ${delay}ms`}`);
            
            if (!isLastAttempt) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw err;
            }
        }
    }
}

async function fetchSeries(seriesId, options = {}) {
    const baseRange = options.range || getDateRange();
    // Disable buffering when in full history mode, use 0 buffer months instead
    const bufferMonths = baseRange.isFullHistory ? 0 : (options.bufferMonths ?? 24);
    const bufferedRange = options.useRange === false ? null : getBufferedRange(baseRange, bufferMonths);
    const rangeKey = bufferedRange
        ? `${formatDateForFRED(bufferedRange.startDate)}_${formatDateForFRED(bufferedRange.endDate)}`
        : 'all';
    const cacheKey = buildCacheKey(seriesId, rangeKey);
    const now = Date.now();

    const memoryCache = dataCache[cacheKey];
    if (memoryCache && now - memoryCache.timestamp < CACHE_DURATION) {
        console.log(`[${seriesId}] Using in-memory cache`);
        return memoryCache.data;
    }

    const localCache = readLocalCache(cacheKey);
    if (localCache && now - localCache.timestamp < CACHE_DURATION) {
        dataCache[cacheKey] = localCache;
        console.log(`[${seriesId}] Using local cache`);
        return localCache.data;
    }

    const targetUrl = new URL(FRED_URL, window.location.origin);
    targetUrl.searchParams.set('series_id', seriesId);
    targetUrl.searchParams.set('file_type', 'json');
    targetUrl.searchParams.set('limit', '10000');
    if (bufferedRange) {
        const startStr = formatDateForFRED(bufferedRange.startDate);
        const endStr = formatDateForFRED(bufferedRange.endDate);
        targetUrl.searchParams.set('observation_start', startStr);
        targetUrl.searchParams.set('observation_end', endStr);
        console.log(`[${seriesId}] Querying FRED: ${startStr} to ${endStr}`);
    }

    const directUrl = targetUrl.toString();
    const requestUrls = FRED_PROXY_BASE
        ? [directUrl]
        : [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`,
            `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(directUrl)}`
        ];

    const staleCache = memoryCache || localCache;

    for (let i = 0; i < requestUrls.length; i++) {
        const requestUrl = requestUrls[i];
        try {
            console.log(`[${seriesId}] Fetching ${i + 1}/${requestUrls.length}...`);
            const res = await fetchWithRetry(requestUrl, 2, 10000);
            const data = await res.json();
            if (data.observations && data.observations.length) {
                const payload = { data: data.observations, timestamp: now };
                dataCache[cacheKey] = payload;
                writeLocalCache(cacheKey, payload);
                console.log(`[${seriesId}] Fetched ${data.observations.length} records`);
                // Log first and last dates to verify the range
                if (data.observations.length > 0) {
                    const firstDate = data.observations[0].date;
                    const lastDate = data.observations[data.observations.length - 1].date;
                    console.log(`[${seriesId}] Date range: ${firstDate} to ${lastDate}`);
                }
                return data.observations;
            }
            throw new Error('No observations');
        } catch (err) {
            console.warn(`[${seriesId}] Fetch failed: ${err.message}`);
        }
    }

    if (staleCache?.data?.length) {
        console.warn(`[${seriesId}] Using stale cached data after fetch failure`);
        return staleCache.data;
    }

    throw new Error(`All fetch attempts failed for ${seriesId}`);
}

async function loadData() {
    setStatus('Loading US economic data...', 'muted');
    try {
        console.log('Starting data load...');
        const results = await Promise.allSettled([
            fetchSeries(GDP_ID),
            fetchSeries(CPI_ID),
            fetchSeries(UNEMPLOYMENT_ID),
            fetchSeries(TEXAS_UNEMPLOYMENT_ID),
            fetchSeries(TYLER_UNEMPLOYMENT_ID),
            fetchSeries(PAYEMS_ID)
        ]);

        // Handle settled promises - use fallback if any fail
        let gdpRaw = [];
        let cpiRaw = [];
        let unemploymentRaw = [];
        let texasUnemploymentRaw = [];
        let tylerUnemploymentRaw = [];
        let payemsRaw = [];

        if (results[0].status === 'fulfilled' && results[0].value?.length) {
            gdpRaw = results[0].value;
        } else {
            console.warn('GDP fetch failed, will use sample data');
        }

        if (results[1].status === 'fulfilled' && results[1].value?.length) {
            cpiRaw = results[1].value;
        } else {
            console.warn('CPI fetch failed, will use sample data');
        }

        if (results[2].status === 'fulfilled' && results[2].value?.length) {
            unemploymentRaw = results[2].value;
        } else {
            console.warn('US Unemployment fetch failed, will use sample data');
        }

        if (results[3].status === 'fulfilled' && results[3].value?.length) {
            texasUnemploymentRaw = results[3].value;
        } else {
            console.warn('Texas unemployment fetch failed');
        }

        if (results[4].status === 'fulfilled' && results[4].value?.length) {
            tylerUnemploymentRaw = results[4].value;
        } else {
            console.warn('Tyler unemployment fetch failed');
        }

        if (results[5].status === 'fulfilled' && results[5].value?.length) {
            payemsRaw = results[5].value;
        } else {
            console.warn('PAYEMS fetch failed, will use sample data');
        }

        // If all series failed, use sample data
        if (!gdpRaw.length && !cpiRaw.length && !unemploymentRaw.length && !payemsRaw.length) {
            throw new Error('All series failed to fetch');
        }

        // Sort GDP data by date and parse
        const gdp = (gdpRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        // Helper function to parse date string to UTC Date object
        const parseUTCDate = (dateStr) => {
            const parts = dateStr.split('-');
            return new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]) || 1));
        };
        
        // Parse US unemployment data as-is from API
        const usUnemployment = (unemploymentRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => parseUTCDate(a.date) - parseUTCDate(b.date));

        // Parse Tyler unemployment data as-is from API
        const tylerUnemployment = (tylerUnemploymentRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => parseUTCDate(a.date) - parseUTCDate(b.date));

        // Parse Texas unemployment data as-is from API (no shifting)
        const texasUnemployment = (texasUnemploymentRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => parseUTCDate(a.date) - parseUTCDate(b.date));

        // Combine US, Texas, and Tyler unemployment data by date (with null values preserved)
        const unemploymentMap = new Map();
        usUnemployment.forEach(d => {
            unemploymentMap.set(d.date, { date: d.date, us: d.value, texas: null, tyler: null });
        });
        texasUnemployment.forEach(d => {
            if (unemploymentMap.has(d.date)) {
                unemploymentMap.get(d.date).texas = d.value;
            } else {
                unemploymentMap.set(d.date, { date: d.date, us: null, texas: d.value, tyler: null });
            }
        });
        tylerUnemployment.forEach(d => {
            if (unemploymentMap.has(d.date)) {
                unemploymentMap.get(d.date).tyler = d.value;
            } else {
                unemploymentMap.set(d.date, { date: d.date, us: null, texas: null, tyler: d.value });
            }
        });

        // Create unemployment array with UTC date sorting, filling in missing months with null values
        const unemploymentArray = Array.from(unemploymentMap.values())
            .sort((a, b) => parseUTCDate(a.date) - parseUTCDate(b.date));
        
        // Fill in any missing months to show gaps in the chart
        const unemployment = [];
        if (unemploymentArray.length > 0) {
            const startDate = parseUTCDate(unemploymentArray[0].date);
            const endDate = parseUTCDate(unemploymentArray[unemploymentArray.length - 1].date);
            
            let currentDate = new Date(startDate);
            let dataIndex = 0;
            
            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().slice(0, 10);
                const existingData = unemploymentArray[dataIndex];
                
                if (existingData && existingData.date === dateStr) {
                    unemployment.push(existingData);
                    dataIndex++;
                } else {
                    // Add missing month with null values to create visible gap
                    unemployment.push({ date: dateStr, us: null, texas: null, tyler: null });
                }
                
                // Move to next month
                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
            }
        }

        // Sort CPI data by date first
        const sortedCpiRaw = (cpiRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate month-over-month % change
        const cpi = [];
        for (let i = 1; i < sortedCpiRaw.length; i++) {
            const curr = sortedCpiRaw[i].value;
            const prev = sortedCpiRaw[i - 1].value;
            if (prev !== 0) {
                const pct = ((curr - prev) / prev) * 100;
                cpi.push({ date: sortedCpiRaw[i].date, value: parseFloat(pct.toFixed(3)) });
            }
        }

        // Parse PAYEMS data - calculate month-over-month change in thousands
        const sortedPayemsRaw = (payemsRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const payems = [];
        for (let i = 1; i < sortedPayemsRaw.length; i++) {
            const curr = sortedPayemsRaw[i].value;
            const prev = sortedPayemsRaw[i - 1].value;
            const change = curr - prev;
            payems.push({ date: sortedPayemsRaw[i].date, value: parseFloat(change.toFixed(0)) });
        }

        cachedData = { gdp, cpi, unemployment, payems };
        dataSource = 'live';
        
        // Log the data information
        console.log(`GDP data points: ${gdp.length}`);
        if (gdp.length > 0) {
            console.log('First GDP:', gdp[0]);
            console.log('Latest GDP:', gdp[gdp.length - 1]);
        }
        
        console.log(`PAYEMS data points: ${payems.length}`);
        if (payems.length > 0) {
            console.log('First PAYEMS:', payems[0]);
            console.log('Latest PAYEMS:', payems[payems.length - 1]);
        } else {
            console.warn('No PAYEMS data available');
        }
        
        console.log(`CPI data points: ${cpi.length}`);
        if (cpi.length > 0) {
            console.log('First CPI:', cpi[0]);
            console.log('Latest CPI:', cpi[cpi.length - 1]);
        }
        
        console.log(`US Unemployment data points: ${usUnemployment.length}`);
        console.log(`Texas Unemployment data points: ${texasUnemployment.length}`);
        console.log(`Tyler Unemployment data points: ${tylerUnemployment.length}`);
        console.log(`Combined Unemployment data points: ${unemployment.length}`);
        
        // Show sample data from each series
        if (usUnemployment.length > 0) {
            console.log('US sample:', usUnemployment.slice(-3));
        }
        if (texasUnemployment.length > 0) {
            console.log('Texas sample:', texasUnemployment.slice(-3));
        }
        if (tylerUnemployment.length > 0) {
            console.log('Tyler sample:', tylerUnemployment.slice(-3));
        }
        
        if (unemployment.length > 0) {
            console.log('First Combined:', unemployment[0]);
            console.log('Latest Combined:', unemployment[unemployment.length - 1]);
        }
        
        setStatus(`Ready - Loaded ${gdp.length} GDP quarters, ${cpi.length} CPI months, ${unemployment.length} unemployment months, ${payems.length} employment months`, 'success');
    } catch (error) {
        console.error('All data fetch attempts failed, falling back to sample data:', error.message);
        // Transform SAMPLE_DATA unemployment to match the live format (us/texas/tyler fields)
        const transformedSampleData = {
            ...SAMPLE_DATA,
            unemployment: SAMPLE_DATA.unemployment.map(d => ({
                date: d.date,
                us: d.value,
                texas: null,
                tyler: null
            }))
        };
        cachedData = transformedSampleData;
        dataSource = 'sample';
        setStatus('⚠️ Using sample data - Live API temporarily unavailable (retrying in 30s)', 'warn');
        
        // Retry after 30 seconds
        setTimeout(() => {
            console.log('Retrying data load after fallback...');
            loadData();
        }, 30000);
    }

    renderAll();
}

async function loadSalesTaxData() {
    const API_URL = 'https://data.texas.gov/resource/53pa-m7sm.json';
    const { startDate, endDate } = getDateRange();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    // Tyler MSA cities
    const msaCities = ['Tyler', 'Lindale', 'Whitehouse', 'Bullard', 'Troup', 'Noonday', 'Arp', 'Winona', 'New Chapel Hill'];
    
    try {
        // Fetch data for all MSA cities
        const allData = [];
        for (const city of msaCities) {
            const query = `?city=${city}&$order=report_year,report_month&$limit=5000`;
            const response = await fetch(API_URL + query);
            
            if (!response.ok) {
                console.warn(`Failed to fetch data for ${city}: ${response.status}`);
                continue;
            }
            
            const cityData = await response.json();
            allData.push(...cityData);
        }
        
        console.log(`Fetched ${allData.length} total records from ${msaCities.length} cities`);
        
        // Group by year and month, tracking city data separately
        const grouped = new Map();
        
        allData.forEach(d => {
            const year = parseInt(d.report_year);
            const month = parseInt(d.report_month);
            const city = d.city || 'Unknown';
            
            // Filter by date range (month/year comparison)
            const itemYearMonth = year * 100 + month;
            const startYearMonth = startDate.getFullYear() * 100 + (startDate.getMonth() + 1);
            const endYearMonth = endDate.getFullYear() * 100 + (endDate.getMonth() + 1);
            
            if (itemYearMonth < startYearMonth || itemYearMonth > endYearMonth) return;
            
            const key = `${year}-${String(month).padStart(2, '0')}`;
            const value = parseFloat(d.net_payment_this_period) || 0;
            
            if (grouped.has(key)) {
                const existing = grouped.get(key);
                existing.totalValue += value;
                if (!existing.cityData) existing.cityData = {};
                existing.cityData[city] = (existing.cityData[city] || 0) + value;
            } else {
                grouped.set(key, {
                    year,
                    month,
                    totalValue: value,
                    cityData: { [city]: value },
                    date: `${year}-${String(month).padStart(2, '0')}-01`
                });
            }
        });
        
        // Convert to array and calculate changes
        salesTaxData = Array.from(grouped.values())
            .sort((a, b) => a.year - b.year || a.month - b.month)
            .map((item, idx, arr) => {
                // Calculate month-over-month change
                let periodChange = 0;
                if (idx > 0) {
                    const prevValue = arr[idx - 1].totalValue;
                    if (prevValue !== 0) {
                        periodChange = ((item.totalValue - prevValue) / prevValue) * 100;
                    }
                }
                
                // Calculate year-over-year change
                let yoyChange = 0;
                const prevYearIdx = arr.findIndex(d => d.year === item.year - 1 && d.month === item.month);
                if (prevYearIdx !== -1) {
                    const prevYearValue = arr[prevYearIdx].totalValue;
                    if (prevYearValue !== 0) {
                        yoyChange = ((item.totalValue - prevYearValue) / prevYearValue) * 100;
                    }
                }
                
                return {
                    date: item.date,
                    value: item.totalValue,
                    cityData: item.cityData || {},
                    periodChange,
                    yoyChange,
                    year: item.year,
                    month: item.month
                };
            });
        
        console.log(`Tyler MSA Sales Tax data points: ${salesTaxData.length}`);
        if (salesTaxData.length > 0) {
            console.log('First MSA Sales Tax:', salesTaxData[0]);
            console.log('Latest MSA Sales Tax:', salesTaxData[salesTaxData.length - 1]);
        }
        
        return salesTaxData;
    } catch (error) {
        console.error('Sales tax fetch failed:', error);
        salesTaxData = [];
        return [];
    }
}

async function loadMedianPriceData() {
    try {
        const { startDate, endDate } = getDateRange();
        
        const medianPriceRaw = await fetchSeries(MEDIAN_PRICE_ID);
        
        medianPriceData = (medianPriceRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => {
                if (Number.isNaN(d.value)) return false;
                return isDateInRange(d.date, startDate, endDate);
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log(`Tyler MSA Median Home Price data points: ${medianPriceData.length}`);
        if (medianPriceData.length > 0) {
            console.log('First Median Price:', medianPriceData[0]);
            console.log('Latest Median Price:', medianPriceData[medianPriceData.length - 1]);
        }
        
        return medianPriceData;
    } catch (error) {
        console.error('Median price fetch failed:', error);
        // Fallback to sample data
        medianPriceData = [
            { date: '2023-01-01', value: 275000 },
            { date: '2023-02-01', value: 278000 },
            { date: '2023-03-01', value: 280000 },
            { date: '2023-04-01', value: 282000 },
            { date: '2023-05-01', value: 285000 },
            { date: '2023-06-01', value: 287000 },
            { date: '2023-07-01', value: 290000 },
            { date: '2023-08-01', value: 288000 },
            { date: '2023-09-01', value: 286000 },
            { date: '2023-10-01', value: 284000 },
            { date: '2023-11-01', value: 283000 },
            { date: '2023-12-01', value: 285000 },
            { date: '2024-01-01', value: 287000 },
            { date: '2024-02-01', value: 290000 },
            { date: '2024-03-01', value: 292000 },
            { date: '2024-04-01', value: 295000 },
            { date: '2024-05-01', value: 298000 },
            { date: '2024-06-01', value: 300000 },
            { date: '2024-07-01', value: 302000 },
            { date: '2024-08-01', value: 305000 },
            { date: '2024-09-01', value: 307000 },
            { date: '2024-10-01', value: 310000 },
            { date: '2024-11-01', value: 312000 },
            { date: '2024-12-01', value: 315000 },
            { date: '2025-01-01', value: 318000 },
            { date: '2025-02-01', value: 320000 },
            { date: '2025-03-01', value: 322000 },
            { date: '2025-04-01', value: 325000 },
            { date: '2025-05-01', value: 327000 }
        ];
        return medianPriceData;
    }
}

function filterData() {
    const { startDate, endDate } = getDateRange();
    
    const gdp = cachedData.gdp.filter(d => {
        return isDateInRange(d.date, startDate, endDate, true); // GDP is quarterly
    });
    const cpi = cachedData.cpi.filter(d => {
        return isDateInRange(d.date, startDate, endDate, false); // CPI is monthly
    });
    const unemployment = cachedData.unemployment.filter(d => {
        return isDateInRange(d.date, startDate, endDate, false); // Monthly
    });
    const payems = cachedData.payems.filter(d => {
        return isDateInRange(d.date, startDate, endDate, false); // Monthly
    });
    return { gdp, cpi, unemployment, payems };
}

function renderCharts(filtered) {
    const gdpCtx = document.getElementById('gdpChart')?.getContext('2d');
    const cpiCtx = document.getElementById('cpiChart')?.getContext('2d');
    if (!gdpCtx || !cpiCtx) return;

    // Destroy existing charts before creating new ones
    destroyChart(gdpChart);
    destroyChart(cpiChart);

    // Check if we should show data labels (15 or fewer bars)
    const showGDPLabels = filtered.gdp.length <= 15;
    const showCPILabels = filtered.cpi.length <= 15;

    const sharedOptions = (showLabels, labelCount, labels, isQuarterly = false) => {
        const recessionPeriods = getRecessionAnnotations(labels, isQuarterly);
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400
            },
            plugins: {
                legend: { display: false },
                recession: {
                    periods: Object.values(recessionPeriods)
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: '#CB6015',
                    borderWidth: 1,
                    callbacks: {
                        label: ctx => `${ctx.parsed.y.toFixed(2)}%`
                    }
                },
                datalabels: showLabels ? {
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold', size: 11 },
                    color: '#0f172a',
                    formatter: (value) => value.toFixed(2) + '%'
                } : { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...getAdaptiveAxisTicks(labelCount),
                        font: { size: getAdaptiveTickFont(labelCount, 12), weight: '500' },
                        color: '#64748b'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => `${v}%` }
                }
            }
        };
    };

    gdpChart = new Chart(gdpCtx, {
        type: 'bar',
        data: {
            labels: filtered.gdp.map(d => formatQuarterLabel(d.date)),
            datasets: [{
                label: 'GDP % QoQ',
                data: filtered.gdp.map(d => d.value),
                backgroundColor: '#CB6015',
                borderRadius: 6
            }]
        },
        options: sharedOptions(showGDPLabels, filtered.gdp.length, filtered.gdp.map(d => formatQuarterLabel(d.date)), true)
    });

    cpiChart = new Chart(cpiCtx, {
        type: 'bar',
        data: {
            labels: filtered.cpi.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: 'CPI-U % MoM',
                data: filtered.cpi.map(d => d.value),
                backgroundColor: '#002F6C',
                borderRadius: 6
            }]
        },
        options: sharedOptions(showCPILabels, filtered.cpi.length, filtered.cpi.map(d => formatMonthLabel(d.date)), false)
    });

    // Note: Unemployment, Payems, and Employment charts are rendered on-demand when their tabs are activated
    // This prevents Chart.js rendering issues with hidden canvases
}

function renderUnemploymentChart(filtered) {
    const canvas = document.getElementById('unemploymentChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const tickConfig = getAdaptiveAxisTicks(filtered.unemployment.length);
    const tickFontSize = getAdaptiveTickFont(filtered.unemployment.length, 12);

    destroyChart(unemploymentChart);

    const allUnemploymentValues = (filtered.unemployment || [])
        .flatMap(d => [d.us, d.texas, d.tyler])
        .filter(v => Number.isFinite(v));

    const minValue = allUnemploymentValues.length ? Math.min(...allUnemploymentValues) : 2;
    const maxValue = allUnemploymentValues.length ? Math.max(...allUnemploymentValues) : 5;
    const suggestedMin = Math.min(2, minValue - 0.5);
    const suggestedMax = Math.max(5, maxValue + 0.5);
    
    unemploymentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filtered.unemployment.map(d => formatMonthLabel(d.date)),
            datasets: [
                {
                    label: 'US Unemployment Rate',
                    data: filtered.unemployment.map(d => d.us),
                    borderColor: '#002F6C',
                    backgroundColor: 'rgba(0, 47, 108, 0.08)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0,
                    spanGaps: false,
                    pointRadius: 0,
                    pointBackgroundColor: '#002F6C',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#002F6C'
                },
                {
                    label: 'Texas Unemployment Rate',
                    data: filtered.unemployment.map(d => d.texas),
                    borderColor: '#0EA5E9',
                    backgroundColor: 'rgba(14, 165, 233, 0.08)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0,
                    spanGaps: false,
                    pointRadius: 0,
                    pointBackgroundColor: '#0EA5E9',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#0EA5E9'
                },
                {
                    label: 'Tyler, TX Unemployment Rate',
                    data: filtered.unemployment.map(d => d.tyler),
                    borderColor: '#CB6015',
                    backgroundColor: 'rgba(203, 96, 21, 0.08)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0,
                    spanGaps: false,
                    pointRadius: 0,
                    pointBackgroundColor: '#CB6015',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#CB6015'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 14, weight: '600' },
                        color: '#0f172a',
                        boxWidth: 8,
                        boxHeight: 8
                    }
                },
                recession: {
                    periods: Object.values(getRecessionAnnotations(filtered.unemployment.map(d => formatMonthLabel(d.date)), false))
                },
                datalabels: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    padding: 14,
                    cornerRadius: 6,
                    borderColor: '#0f172a',
                    borderWidth: 1,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        title: (context) => context[0].label,
                        label: (context) => {
                            if (context.parsed.y === null) return `${context.dataset.label}: N/A`;
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...tickConfig,
                        font: { size: tickFontSize, weight: '500' },
                        color: '#64748b'
                    }
                },
                y: {
                    beginAtZero: false,
                    suggestedMin,
                    suggestedMax,
                    grid: { color: 'rgba(100, 116, 139, 0.12)', drawBorder: true },
                    ticks: {
                        callback: (value) => `${value}%`,
                        font: { size: 12, weight: '500' },
                        color: '#64748b',
                        padding: 8
                    }
                }
            }
        }
    });
}

function renderEmploymentChart() {
    const canvas = document.getElementById('employmentChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const empData = parseEmploymentData();
    
    // Check if data is available before rendering
    if (!empData || (!empData.tyler || empData.tyler.length === 0) && (!empData.texas || empData.texas.length === 0)) {
        console.warn('Employment data not available yet');
        return;
    }
    
    // Filter by date range
    const { startDate, endDate } = getDateRange();
    
    const filteredTyler = empData.tyler.filter(d => {
        return isDateInRange(d.date, startDate, endDate);
    });
    
    const filteredTexas = empData.texas.filter(d => {
        return isDateInRange(d.date, startDate, endDate);
    });

    const showLabels = filteredTyler.length <= 15;

    // Combine dates from both series to ensure alignment
    const allDates = new Set([
        ...filteredTyler.map(d => d.date),
        ...filteredTexas.map(d => d.date)
    ]);
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    const tickConfig = getAdaptiveAxisTicks(sortedDates.length);
    const tickFontSize = getAdaptiveTickFont(sortedDates.length, 12);

    destroyChart(employmentChart);
    
    employmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDates.map(d => formatMonthLabel(d)),
            datasets: [
                {
                    label: 'Tyler MSA (% Change Annual Rate)',
                    data: sortedDates.map(date => {
                        const entry = filteredTyler.find(d => d.date === date);
                        return entry ? entry.value : null;
                    }),
                    backgroundColor: '#CB6015',
                    borderRadius: 6
                },
                {
                    label: 'Texas (% Change, SA)',
                    data: sortedDates.map(date => {
                        const entry = filteredTexas.find(d => d.date === date);
                        return entry ? entry.value : null;
                    }),
                    backgroundColor: '#002F6C',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 14, weight: '600' },
                        color: '#0f172a'
                    }
                },
                datalabels: showLabels ? {
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold', size: 11 },
                    color: '#0f172a',
                    formatter: (value, context) => {
                        // Skip null values (missing data for this date)
                        if (value === null) return '';
                        
                        // Both Tyler and Texas are now in percent form (e.g., 2.4 for 2.4%)
                        return value.toFixed(2) + '%';
                    }
                } : { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: '#CB6015',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            // Handle null values (missing data for this date)
                            if (context.parsed.y === null) {
                                return `${context.dataset.label}: N/A`;
                            }
                            
                            // Both Tyler and Texas are now in percent form (e.g., 2.4 for 2.4%)
                            const displayValue = context.parsed.y.toFixed(2);
                            return `${context.dataset.label}: ${displayValue}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...tickConfig,
                        font: { size: tickFontSize, weight: '500' },
                        color: '#475569'
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (value) => {
                            // Y-axis shows the range for both datasets
                            // Since Tyler is already percent, show it as-is
                            // Texas values are decimal but small, so multiply by 100 conceptually
                            // Use Tyler scale (already percent)
                            return `${value.toFixed(2)}%`;
                        },
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    },
                    title: {
                        display: true,
                        text: 'Percent Change (Seasonally Adjusted)',
                        font: { size: 11, weight: '600' },
                        color: '#64748b'
                    }
                }
            }
        }
    });
}

function renderSalesTaxChart() {
    const canvas = document.getElementById('salesTaxChart');
    if (!canvas || !salesTaxData || salesTaxData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    // Filter by date range
    const { startDate, endDate } = getDateRange();
    
    const filteredData = salesTaxData.filter(d => {
        // Compare year and month
        const itemYearMonth = d.year * 100 + d.month;
        const startYearMonth = startDate.getFullYear() * 100 + (startDate.getMonth() + 1);
        const endYearMonth = endDate.getFullYear() * 100 + (endDate.getMonth() + 1);
        return itemYearMonth >= startYearMonth && itemYearMonth <= endYearMonth;
    });
    
    if (filteredData.length === 0) {
        console.warn('No sales tax data available for selected year range');
        return;
    }
    
    const showLabels = filteredData.length <= 15;
    const tickConfig = getAdaptiveAxisTicks(filteredData.length);
    const tickFontSize = getAdaptiveTickFont(filteredData.length, 11);

    destroyChart(salesTaxChart);
    
    salesTaxChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filteredData.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: 'Net Collections',
                data: filteredData.map(d => d.value),
                backgroundColor: '#CB6015',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 40
                }
            },
            animation: { duration: 400 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                datalabels: showLabels ? {
                    display: true,
                    anchor: 'center',
                    align: 'center',
                    font: { weight: 'bold', size: 11 },
                    color: '#ffffff',
                    formatter: (value) => `$${(value / 1000000).toFixed(1)}M`
                } : { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: '#CB6015',
                    borderWidth: 1,
                    callbacks: {
                        title: (items) => {
                            if (items.length > 0) {
                                const idx = items[0].dataIndex;
                                const data = filteredData[idx];
                                return formatMonthLabel(data.date);
                            }
                            return '';
                        },
                        label: (context) => {
                            const value = context.parsed.y;
                            return `Total: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                        },
                        afterLabel: (context) => {
                            const idx = context.dataIndex;
                            const data = filteredData[idx];
                            return [
                                `MoM Change: ${data.periodChange.toFixed(2)}%`,
                                `YoY Change: ${data.yoyChange.toFixed(2)}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...tickConfig,
                        font: { size: tickFontSize, weight: '500' },
                        color: '#475569'
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (value) => {
                            // Format as millions
                            return `$${(value / 1000000).toFixed(1)}M`;
                        },
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    }
                }
            }
        }
    });
}

function renderPayemsChart(filtered) {
    const canvas = document.getElementById('payemsChart');
    if (!canvas) {
        console.error('PAYEMS canvas element not found');
        return;
    }
    
    if (!filtered || !filtered.payems) {
        console.error('Filtered object or payems data missing', { hasFiltered: !!filtered, hasPayems: filtered?.payems ? true : false });
        return;
    }
    
    if (filtered.payems.length === 0) {
        console.error('PAYEMS array is empty');
        return;
    }

    const ctx = canvas.getContext('2d');
    const showLabels = filtered.payems.length <= 15;
    const tickConfig = getAdaptiveAxisTicks(filtered.payems.length);
    const tickFontSize = getAdaptiveTickFont(filtered.payems.length, 11);

    destroyChart(payemsChart);
    
    payemsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filtered.payems.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: 'Nonfarm Employment Change',
                data: filtered.payems.map(d => d.value),
                backgroundColor: '#002F6C',
                borderColor: '#002F6C',
                borderWidth: 1,
                hoverBackgroundColor: '#004999',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                datalabels: showLabels ? {
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold', size: 11 },
                    color: '#0f172a',
                    formatter: (value) => value.toLocaleString() + 'K'
                } : { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#002F6C',
                    borderWidth: 1,
                    callbacks: {
                        title: (context) => context[0].label,
                        label: (context) => `Change: ${context.parsed.y.toLocaleString()} thousands`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...tickConfig,
                        font: { size: tickFontSize },
                        color: '#64748b'
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (value) => {
                            return `${value.toLocaleString()}K`;
                        },
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    }
                }
            }
        }
    });
}

function renderMedianPriceChart() {
    const canvas = document.getElementById('medianPriceChart');
    if (!canvas || !medianPriceData || medianPriceData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    // Filter by date range
    const { startDate, endDate } = getDateRange();
    
    const filteredData = medianPriceData.filter(d => {
        return isDateInRange(d.date, startDate, endDate);
    });

    // Data is already month-over-month percentage changes from FRED
    const showLabels = filteredData.length <= 15;
    const tickConfig = getAdaptiveAxisTicks(filteredData.length);
    const tickFontSize = getAdaptiveTickFont(filteredData.length, 12);

    destroyChart(medianPriceChart);
    
    medianPriceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filteredData.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: 'MoM % Change',
                data: filteredData.map(d => d.value),
                backgroundColor: '#002F6C',
                borderColor: '#002F6C',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                datalabels: showLabels ? {
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold', size: 11 },
                    color: '#0f172a',
                    formatter: (value) => value.toFixed(2) + '%'
                } : { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: '#002F6C',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => `MoM Change: ${context.parsed.y.toFixed(2)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...tickConfig,
                        font: { size: tickFontSize, weight: '500' },
                        color: '#475569'
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (value) => `${value}%`,
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    }
                }
            }
        }
    });
}

async function loadMortgageData() {
    try {
        console.log('Loading mortgage data...');
        
        // Fetch both 30-year and 15-year rates from FRED API
        console.log('Fetching MORTGAGE30US and MORTGAGE15US from FRED...');
        const [data30, data15] = await Promise.all([
            fetchSeries(MORTGAGE30_ID),
            fetchSeries(MORTGAGE15_ID)
        ]);
        
        console.log('MORTGAGE30US data points:', data30?.length || 0);
        console.log('MORTGAGE15US data points:', data15?.length || 0);
        
        // Log sample of first data point for each
        if (data30 && data30.length > 0) {
            console.log('MORTGAGE30US sample:', data30[0]);
        }
        if (data15 && data15.length > 0) {
            console.log('MORTGAGE15US sample:', data15[0]);
        }
        
        if (!data30 || data30.length === 0) {
            console.warn('No 30-year mortgage data received');
        }
        if (!data15 || data15.length === 0) {
            console.warn('No 15-year mortgage data received');
        }
        
        // Combine the data by date
        const dateMap = new Map();
        
        data30.forEach(point => {
            dateMap.set(point.date, { 
                date: point.date, 
                rate30yr: parseFloat(point.value),
                rate15yr: null 
            });
        });
        
        data15.forEach(point => {
            if (dateMap.has(point.date)) {
                dateMap.get(point.date).rate15yr = parseFloat(point.value);
            } else {
                dateMap.set(point.date, {
                    date: point.date,
                    rate30yr: null,
                    rate15yr: parseFloat(point.value)
                });
            }
        });
        
        mortgageData = Array.from(dateMap.values()).sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        console.log(`Mortgage rates data points combined: ${mortgageData.length}`);
        if (mortgageData.length > 0) {
            console.log('First Mortgage Rate:', mortgageData[0]);
            console.log('Latest Mortgage Rate:', mortgageData[mortgageData.length - 1]);
        }
        
        mortgageLoaded = true;
        return mortgageData;
    } catch (error) {
        console.error('Mortgage data load failed:', error);
        console.error('Error details:', error.message, error.stack);
        mortgageData = [];
        mortgageLoaded = false;
        return [];
    }
}

async function loadEmploymentData() {
    try {
        console.log('Loading regional employment data...');
        
        // Fetch both Tyler and Texas payroll data from FRED API
        console.log('Fetching TYLSA158MFRBDAL and TX0000000M175FRBDAL from FRED...');
        const [tylerRaw, texasRaw] = await Promise.all([
            fetchSeries(TYLER_PAYROLL_ID),  // Already in percent change
            fetchSeries(TEXAS_PAYROLL_ID)   // In thousands of persons - needs conversion
        ]);
        
        console.log('TYLSA158MFRBDAL data points:', tylerRaw?.length || 0);
        console.log('TX0000000M175FRBDAL data points:', texasRaw?.length || 0);
        
        // Log first few entries to verify data
        if (tylerRaw && tylerRaw.length > 0) {
            console.log('Tyler sample data:', tylerRaw.slice(0, 3));
        }
        if (texasRaw && texasRaw.length > 0) {
            console.log('Texas sample data:', texasRaw.slice(0, 3));
        }
        
        if (!tylerRaw || tylerRaw.length === 0) {
            console.warn('No Tyler payroll data received');
        }
        if (!texasRaw || texasRaw.length === 0) {
            console.warn('No Texas payroll data received');
        }
        
        // Tyler data is already in percent change from FRED (not decimal!) - use as-is
        // Format: 1.5 means 1.5%, not 0.015
        const tylerPercent = tylerRaw ? tylerRaw.map(d => ({
            date: d.date.trim(),
            value: parseFloat(d.value)  // Already percent from FRED API
        })) : [];
        
        // Calculate month-over-month annualized percent change for Texas (from employment levels in thousands)
        function calculateTexasPercentChange(rawData) {
            if (!rawData || rawData.length === 0) return [];
            
            const sorted = rawData
                .map(d => ({
                    date: d.date.trim(),
                    value: parseFloat(d.value)
                }))
                .filter(d => !isNaN(d.value))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Need at least 2 data points to calculate change
            if (sorted.length < 2) return [];
            
            const percentChangeData = [];
            // Start from index 1 since we need a previous month to calculate change
            for (let i = 1; i < sorted.length; i++) {
                const current = sorted[i];
                const previous = sorted[i - 1];
                const monthlyPercentChange = (current.value - previous.value) / previous.value;
                
                // Annualize the monthly percent change: ((1 + monthly%)^12 - 1) * 100
                const annualizedPercentChange = (Math.pow(1 + monthlyPercentChange, 12) - 1) * 100;
                
                percentChangeData.push({
                    date: current.date,
                    value: parseFloat(annualizedPercentChange.toFixed(2))
                });
            }
            
            return percentChangeData;
        }
        
        const texasPercent = calculateTexasPercentChange(texasRaw);
        
        console.log('Tyler percent data points:', tylerPercent.length);
        console.log('Texas percent change data points:', texasPercent.length);
        if (tylerPercent.length > 0) console.log('Tyler sample:', tylerPercent.slice(0, 3));
        if (texasPercent.length > 0) console.log('Texas percent sample:', texasPercent.slice(0, 3));
        
        // Combine the data by date
        const dateMap = new Map();
        
        if (tylerPercent && tylerPercent.length > 0) {
            tylerPercent.forEach(point => {
                dateMap.set(point.date, { 
                    date: point.date, 
                    tyler: point.value,
                    texas: null 
                });
            });
        }
        
        if (texasPercent && texasPercent.length > 0) {
            texasPercent.forEach(point => {
                if (dateMap.has(point.date)) {
                    dateMap.get(point.date).texas = point.value;
                } else {
                    dateMap.set(point.date, {
                        date: point.date,
                        tyler: null,
                        texas: point.value
                    });
                }
            });
        }
        
        employmentData = Array.from(dateMap.values()).sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        console.log(`Employment data points combined: ${employmentData.length}`);
        if (employmentData.length > 0) {
            console.log('First Employment:', employmentData[0]);
            console.log('Latest Employment:', employmentData[employmentData.length - 1]);
            console.log('Sample combined data:', employmentData.slice(0, 3));
        }
        
        employmentLoaded = true;
        return employmentData;
    } catch (error) {
        console.error('Employment data load failed:', error);
        console.error('Error details:', error.message, error.stack);
        employmentData = [];
        employmentLoaded = false;
        return [];
    }
}

function renderMortgageCharts() {
    console.log('renderMortgageCharts called');
    const canvas30 = document.getElementById('mortgage30Chart');
    const canvas15 = document.getElementById('mortgage15Chart');
    
    if (!canvas30) {
        console.error('mortgage30Chart canvas not found');
        return;
    }
    if (!canvas15) {
        console.error('mortgage15Chart canvas not found');
        return;
    }
    if (!mortgageData || mortgageData.length === 0) {
        console.warn('No mortgage data available to render');
        return;
    }
    
    console.log('Rendering mortgage charts with', mortgageData.length, 'data points');
    
    const ctx30 = canvas30.getContext('2d');
    const ctx15 = canvas15.getContext('2d');
    
    // Filter by date range
    const { startDate, endDate } = getDateRange();
    console.log('Date range:', startDate, 'to', endDate);
    
    const filteredByYear = mortgageData.filter(d => {
        return isDateInRange(d.date, startDate, endDate);
    });
    console.log('Filtered data points:', filteredByYear.length);
    
    // Filter data for each chart
    const data30 = filteredByYear.filter(d => d.rate30yr !== null);
    const data15 = filteredByYear.filter(d => d.rate15yr !== null);
    console.log('30-year data points:', data30.length);
    console.log('15-year data points:', data15.length);
    const tickConfig30 = getAdaptiveAxisTicks(data30.length);
    const tickFontSize30 = getAdaptiveTickFont(data30.length, 12);
    const tickConfig15 = getAdaptiveAxisTicks(data15.length);
    const tickFontSize15 = getAdaptiveTickFont(data15.length, 12);
    
    // 30-Year Chart
    destroyChart(mortgage30Chart);
    
    mortgage30Chart = new Chart(ctx30, {
        type: 'line',
        data: {
            labels: data30.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: '30-Year Fixed Rate',
                data: data30.map(d => d.rate30yr),
                borderColor: '#CB6015',
                backgroundColor: 'rgba(203, 96, 21, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointBackgroundColor: '#CB6015',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#CB6015'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: '#CB6015',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => `Rate: ${context.parsed.y.toFixed(2)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...tickConfig30,
                        font: { size: tickFontSize30, weight: '500' },
                        color: '#475569'
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (value) => `${value}%`,
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    }
                }
            }
        }
    });
    
    // 15-Year Chart
    destroyChart(mortgage15Chart);
    
    mortgage15Chart = new Chart(ctx15, {
        type: 'line',
        data: {
            labels: data15.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: '15-Year Fixed Rate',
                data: data15.map(d => d.rate15yr),
                borderColor: '#002F6C',
                backgroundColor: 'rgba(0, 47, 108, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointBackgroundColor: '#002F6C',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#002F6C'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    borderColor: '#002F6C',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => `Rate: ${context.parsed.y.toFixed(2)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        ...tickConfig15,
                        font: { size: tickFontSize15, weight: '500' },
                        color: '#475569'
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        callback: (value) => `${value}%`,
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    }
                }
            }
        }
    });
}

// ========== Texas Revenue Functions ==========

async function renderAll() {
    if (!cachedData) return;
    const filtered = filterData();
    
    // Always render US indicators (GDP, CPI, Unemployment, PAYEMS)
    renderCharts(filtered);
    renderUnemploymentChart(filtered);
    renderPayemsChart(filtered);
    
    // Render regional indicators
    renderEmploymentChart();
    
    // Reload and render regional data that requires API calls
    showLoadingIndicator('loading all data');
    try {
        await loadSalesTaxData();
        renderSalesTaxChart();
    } catch (e) {
        console.error('Sales tax load failed:', e);
    }
    
    try {
        await loadMedianPriceData();
        renderMedianPriceChart();
    } catch (e) {
        console.error('Median price load failed:', e);
    }
    
    try {
        await loadMortgageData();
        renderMortgageCharts();
    } catch (e) {
        console.error('Mortgage load failed:', e);
    }
    
    hideLoadingIndicator();
    document.body.classList.remove('is-loading');
}

function handleGDPDownload() {
    if (!cachedData) return;
    const filtered = filterData();
    
    let csv = 'Date,GDP (% QoQ)\n';
    filtered.gdp.forEach(d => {
        csv += `${formatQuarterLabel(d.date)},${d.value.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `us_gdp_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleCPIDownload() {
    if (!cachedData) return;
    const filtered = filterData();
    
    let csv = 'Date,CPI-U (% MoM)\n';
    filtered.cpi.forEach(d => {
        csv += `${formatMonthLabel(d.date)},${d.value.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `us_cpi_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleUnemploymentDownload() {
    if (!cachedData) return;
    const filtered = filterData();
    
    let csv = 'Date,US Unemployment Rate (%),Texas Unemployment Rate (%),Tyler Unemployment Rate (%)\n';
    filtered.unemployment.forEach(d => {
        const us = d.us !== null ? d.us.toFixed(1) : '';
        const texas = d.texas !== null ? d.texas.toFixed(1) : '';
        const tyler = d.tyler !== null ? d.tyler.toFixed(1) : '';
        csv += `${formatMonthLabel(d.date)},${us},${texas},${tyler}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unemployment_rates_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handlePayemsDownload() {
    if (!cachedData) return;
    const filtered = filterData();
    
    let csv = 'Date,Nonfarm Payroll Change (Thousands)\n';
    filtered.payems.forEach(d => {
        csv += `${formatMonthLabel(d.date)},${d.value}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `us_payroll_employment_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ========== Date Formatting and Parsing ==========

// Parse date string in UTC to show most recent data
function parseLocalDate(dateStr) {
    // Handle both "YYYY-MM-DD" and "M/D/YYYY" formats
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        // Create UTC date
        return new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]) || 1, 0, 0, 0, 0));
    } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        // Create UTC date
        return new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]) || 1, 0, 0, 0, 0));
    }
    return new Date(dateStr);
}

function formatQuarterLabel(dateStr) {
    const d = parseLocalDate(dateStr);
    const month = d.getUTCMonth(); // Use UTC methods
    const year = d.getUTCFullYear();
    const q = Math.floor(month / 3) + 1;
    return `Q${q} ${year}`;
}

function formatMonthLabel(dateStr) {
    // Parse as UTC date for consistent display
    const d = parseLocalDate(dateStr);
    const options = { month: 'short', year: 'numeric', timeZone: 'UTC' };
    return d.toLocaleDateString('en-US', options);
}

function formatDateDisplay(dateStr) {
    // Parse as UTC date for consistent display
    const d = parseLocalDate(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
    return d.toLocaleDateString('en-US', options);
}

function handleEmploymentDownload() {
    const empData = parseEmploymentData();
    const { startDate, endDate } = getDateRange();
    
    const filteredTyler = empData.tyler.filter(d => {
        return isDateInRange(d.date, startDate, endDate);
    });
    
    const filteredTexas = empData.texas.filter(d => {
        return isDateInRange(d.date, startDate, endDate);
    });
    
    let csv = 'Date,Tyler Employment (% Change),Texas Employment (% Change)\n';
    
    filteredTyler.forEach((item, index) => {
        const texasValue = filteredTexas[index]?.value;
        csv += `${formatMonthLabel(item.date)},${item.value.toFixed(1)},${texasValue !== undefined ? texasValue.toFixed(1) : ''}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employment_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleSalesTaxDownload() {
    if (!salesTaxData || salesTaxData.length === 0) {
        alert('No sales tax data available to download.');
        return;
    }
    
    // Get all unique cities
    const allCities = new Set();
    salesTaxData.forEach(d => {
        Object.keys(d.cityData || {}).forEach(city => allCities.add(city));
    });
    const cities = Array.from(allCities).sort();
    
    // Create header with city columns
    let csv = 'Date,Total ($),' + cities.map(c => `${c} ($)`).join(',') + ',Period Change (%),Year-over-Year Change (%)\n';
    
    salesTaxData.forEach(item => {
        csv += `${formatMonthLabel(item.date)},`;
        csv += `${item.value.toFixed(2)},`;
        csv += cities.map(city => `${(item.cityData[city] || 0).toFixed(2)}`).join(',') + ',';
        csv += `${item.periodChange.toFixed(2)},`;
        csv += `${item.yoyChange.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tyler_sales_tax_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleMedianPriceDownload() {
    if (!medianPriceData || medianPriceData.length === 0) {
        alert('No median price data available to download.');
        return;
    }
    
    let csv = 'Date,Median Listing Price ($),Month-Over-Month Change (%)\n';
    
    // Calculate MoM changes for CSV
    for (let i = 0; i < medianPriceData.length; i++) {
        const item = medianPriceData[i];
        let momChange = '';
        
        if (i > 0) {
            const prevValue = medianPriceData[i - 1].value;
            const percentChange = ((item.value - prevValue) / prevValue) * 100;
            momChange = percentChange.toFixed(2);
        }
        
        csv += `${formatMonthLabel(item.date)},${item.value.toFixed(0)},${momChange}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tyler_median_home_price_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleMortgageDownload() {
    if (!mortgageData || mortgageData.length === 0) {
        alert('No mortgage rates data available to download.');
        return;
    }
    
    // Filter by current date range
    const { startDate, endDate } = getDateRange();
    const filteredData = mortgageData.filter(d => {
        return isDateInRange(d.date, startDate, endDate);
    });
    
    if (filteredData.length === 0) {
        alert('No mortgage rates data available in the selected date range.');
        return;
    }
    
    let csv = 'Date,30-Year Fixed Rate (%),15-Year Fixed Rate (%)\n';
    
    filteredData.forEach(item => {
        csv += `${formatMonthLabel(item.date)},`;
        csv += `${item.rate30yr !== null ? item.rate30yr.toFixed(2) : ''},`;
        csv += `${item.rate15yr !== null ? item.rate15yr.toFixed(2) : ''}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `us_mortgage_rates_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function handleTaxDownload() {
    try {
        if (typeof ExcelDataLoader === 'undefined') {
            alert('Excel data loader not available. Please refresh and try again.');
            return;
        }

        const dropdown = document.getElementById('taxYearSelect');
        const fiscalYear = dropdown?.value;

        if (!fiscalYear || fiscalYear === 'Loading...') {
            alert('No fiscal year selected yet. Please wait for the data to load.');
            return;
        }

        const sheetRows = await ExcelDataLoader.getSheet(fiscalYear);
        if (!Array.isArray(sheetRows) || sheetRows.length === 0) {
            alert('No tax data available to download.');
            return;
        }

        const columnKeys = [];
        const seenKeys = new Set();
        sheetRows.forEach(row => {
            Object.keys(row || {}).forEach(key => {
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    columnKeys.push(key);
                }
            });
        });

        if (columnKeys.length === 0) {
            alert('No tax data available to download.');
            return;
        }

        const escapeCsvValue = (value) => {
            if (value === null || value === undefined) return '';
            const text = String(value);
            if (/[",\n\r]/.test(text)) {
                return `"${text.replace(/"/g, '""')}"`;
            }
            return text;
        };

        let csv = columnKeys.map(escapeCsvValue).join(',') + '\n';

        sheetRows.forEach(row => {
            const line = columnKeys.map(key => escapeCsvValue(row?.[key])).join(',');
            csv += line + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `texas_tax_revenue_${fiscalYear}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Tax download failed:', error);
        alert('Failed to download tax data. Please check the console for details.');
    }
}

function wireEvents() {
    // Full history toggle - disable/enable start date input and trigger update
    const fullHistoryToggle = document.getElementById('fullHistoryToggle');
    const startDateEl = document.getElementById('startDate');
    if (fullHistoryToggle) {
        fullHistoryToggle.addEventListener('change', (e) => {
            if (startDateEl) {
                startDateEl.disabled = e.target.checked;
            }
            // Clear cache when toggling full history to force fresh fetch
            for (const key in dataCache) {
                delete dataCache[key];
            }
            const now = Date.now();
            const storagePrefixLen = STORAGE_PREFIX.length + 1; // +1 for the colon
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX + ':')) {
                    localStorage.removeItem(key);
                }
            }
            console.log('[FullHistory] Cache cleared');
            
            // Re-fetch data with new date range instead of just re-filtering
            loadData();
        });
    }
    
    // Update button with validation
    document.getElementById('updateBtn')?.addEventListener('click', () => {
        const { startDate, endDate } = getDateRange();
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        
        if (validateYearRange(startYear, endYear)) {
            // Clear cache to force fresh FRED API fetch with new date range
            for (const key in dataCache) {
                delete dataCache[key];
            }
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(STORAGE_PREFIX + ':')) {
                    localStorage.removeItem(key);
                }
            }
            console.log('[UpdateBtn] Cache cleared, refetching data...');
            
            // Re-fetch data with new date range
            loadData();
        }
    });
    
    document.getElementById('downloadGDPBtn')?.addEventListener('click', handleGDPDownload);
    document.getElementById('downloadCPIBtn')?.addEventListener('click', handleCPIDownload);
    document.getElementById('downloadUnemploymentBtn')?.addEventListener('click', handleUnemploymentDownload);
    document.getElementById('downloadPayemsBtn')?.addEventListener('click', handlePayemsDownload);
    document.getElementById('downloadEmploymentBtn')?.addEventListener('click', handleEmploymentDownload);
    document.getElementById('downloadSalesTaxBtn')?.addEventListener('click', handleSalesTaxDownload);
    document.getElementById('downloadMedianPriceBtn')?.addEventListener('click', handleMedianPriceDownload);
    document.getElementById('downloadMortgageBtn')?.addEventListener('click', handleMortgageDownload);
    document.getElementById('downloadTaxBtn')?.addEventListener('click', handleTaxDownload);
}

// ========== Share Functionality ==========

function getChartImageWithBackground(chartInstance, scale = 2) {
    // Get the original canvas
    const originalCanvas = chartInstance.canvas;
    const width = originalCanvas.width;
    const height = originalCanvas.height;
    
    // Create a new canvas with white background
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    // Scale the context for higher quality
    ctx.scale(scale, scale);
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw the chart on top
    ctx.drawImage(originalCanvas, 0, 0, width, height);
    
    // Return as base64
    return canvas.toDataURL('image/png');
}

function setupShareButtons() {
    const shareButtons = [
        { id: 'shareGDPBtn', chart: () => gdpChart, name: 'Real GDP Growth' },
        { id: 'shareCPIBtn', chart: () => cpiChart, name: 'CPI-U Inflation' },
        { id: 'shareUnemploymentBtn', chart: () => unemploymentChart, name: 'Unemployment Rate' },
        { id: 'sharePayemsBtn', chart: () => payemsChart, name: 'Nonfarm Payroll Employment' },
        { id: 'shareEmploymentBtn', chart: () => employmentChart, name: 'Employment Trends' },
        { id: 'shareSalesTaxBtn', chart: () => salesTaxChart, name: 'Tyler MSA Sales Tax' },
        { id: 'shareMedianPriceBtn', chart: () => medianPriceChart, name: 'Tyler Median Home Price' },
        { id: 'shareTaxBtn', chart: () => (window.taxChart ? window.taxChart.getChart() : null), name: 'Texas Tax Revenue' }
    ];

    shareButtons.forEach(({ id, chart, name }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => shareChart(chart(), name));
        }
    });

    // Special handler for mortgage rates (both 30 and 15 year)
    const mortgageBtn = document.getElementById('shareMortgageBtn');
    if (mortgageBtn) {
        mortgageBtn.addEventListener('click', () => shareMortgageCharts());
    }
}

function shareChart(chartInstance, chartName) {
    if (!chartInstance) {
        alert('Chart not yet loaded. Please wait for data to load.');
        return;
    }

    try {
        // Get chart as base64 image with white background and 2x scale for higher quality
        const imageUrl = getChartImageWithBackground(chartInstance, 2);
        
        // Create share URL
        const dashboardUrl = window.location.href.split('?')[0];
        const shareText = `${chartName} - Hibbs Monitor Dashboard`;
        
        // Convert base64 to blob using a more reliable method
        const base64Data = imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        const file = new File([blob], `${chartName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
        
        // Check if Web Share API with files is available (mainly mobile)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                title: shareText,
                text: `Check out this chart from UT Tyler Hibbs Institute Economic Dashboard`,
                url: dashboardUrl,
                files: [file]
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                    fallbackShare(imageUrl, blob, shareText, dashboardUrl, chartName);
                }
            });
        } else {
            // Show share modal with download and social options
            fallbackShare(imageUrl, blob, shareText, dashboardUrl, chartName);
        }
    } catch (error) {
        console.error('Error sharing chart:', error);
        alert('Unable to share chart. Please try again.');
    }
}

function shareMortgageCharts() {
    if (!mortgage30Chart || !mortgage15Chart) {
        alert('Charts not yet loaded. Please wait for data to load.');
        return;
    }

    try {
        // Get both charts as base64 images with white background and 2x scale for higher quality
        const image30 = getChartImageWithBackground(mortgage30Chart, 2);
        const image15 = getChartImageWithBackground(mortgage15Chart, 2);
        
        // Create share URL
        const dashboardUrl = window.location.href.split('?')[0];
        const shareText = 'Mortgage Rates - Hibbs Monitor Dashboard';
        
        // Convert base64 to blobs using a more reliable method
        const base64Data30 = image30.split(',')[1];
        const byteCharacters30 = atob(base64Data30);
        const byteNumbers30 = new Array(byteCharacters30.length);
        for (let i = 0; i < byteCharacters30.length; i++) {
            byteNumbers30[i] = byteCharacters30.charCodeAt(i);
        }
        const byteArray30 = new Uint8Array(byteNumbers30);
        const blob30 = new Blob([byteArray30], { type: 'image/png' });
        
        const base64Data15 = image15.split(',')[1];
        const byteCharacters15 = atob(base64Data15);
        const byteNumbers15 = new Array(byteCharacters15.length);
        for (let i = 0; i < byteCharacters15.length; i++) {
            byteNumbers15[i] = byteCharacters15.charCodeAt(i);
        }
        const byteArray15 = new Uint8Array(byteNumbers15);
        const blob15 = new Blob([byteArray15], { type: 'image/png' });
        
        // For mortgage rates, show both charts in the modal
        fallbackShareMortgage(image30, image15, blob30, blob15, shareText, dashboardUrl);
    } catch (error) {
        console.error('Error sharing mortgage charts:', error);
        alert('Unable to share charts. Please try again.');
    }
}

function fallbackShare(imageUrl, imageBlob, shareText, dashboardUrl, chartName) {
    // Create modal for share options
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 16px;
        overflow-y: auto;
    `;
    
    const content = document.createElement('div');
    const isMobile = window.innerWidth <= 640;
    content.style.cssText = `
        background: white;
        border-radius: ${isMobile ? '12px' : '14px'};
        padding: ${isMobile ? '20px' : '24px'};
        max-width: 500px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    const buttonStyle = isMobile 
        ? 'padding: 12px 10px; background: {bg}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; touch-action: manipulation;'
        : 'padding: 10px 12px; background: {bg}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;';
    
    content.innerHTML = `
        <h3 style="margin: 0 0 ${isMobile ? '12px' : '16px'} 0; color: #0f172a; font-size: ${isMobile ? '1.1rem' : '1.25rem'};">Share Chart</h3>
        <div style="margin-bottom: ${isMobile ? '16px' : '20px'};">
            <img src="${imageUrl}" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;" alt="Chart preview">
        </div>
        
        <div style="margin-bottom: 16px;">
            <button id="downloadImage" style="width: 100%; padding: ${isMobile ? '14px' : '12px'}; background: #CB6015; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: ${isMobile ? '52px' : 'auto'}; touch-action: manipulation; box-shadow: 0 2px 8px rgba(203, 96, 21, 0.3);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PNG Image
            </button>
        </div>
        
        <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 500; text-align: center;">Share on social media:</p>
            <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : 'repeat(2, 1fr)'}; gap: ${isMobile ? '10px' : '8px'};">
                <button id="postTwitter" style="${buttonStyle.replace('{bg}', '#000000')}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="vertical-align: middle;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span>X (Twitter)</span>
                </button>
                <button id="postLinkedIn" style="${buttonStyle.replace('{bg}', '#0A66C2')}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="vertical-align: middle;"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                    <span>LinkedIn</span>
                </button>
                <button id="postFacebook" style="${buttonStyle.replace('{bg}', '#1877F2')}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="vertical-align: middle;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <span>Facebook</span>
                </button>
                <button id="copyImage" style="${buttonStyle.replace('{bg}', '#10b981')}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="vertical-align: middle;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span>Copy Image</span>
                </button>
            </div>
        </div>
        
        <div style="margin-top: 12px;">
            <button id="closeModal" style="width: 100%; padding: ${isMobile ? '12px' : '10px 12px'}; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; min-height: ${isMobile ? '48px' : 'auto'}; touch-action: manipulation;">
                Close
            </button>
        </div>
        
        <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8; text-align: center;">Tip: Download the image first, then upload to social media for best results</p>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Close button
    content.querySelector('#closeModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Download image - Primary action
    content.querySelector('#downloadImage').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(imageBlob);
        a.download = `${chartName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        
        // Show success message
        const btn = content.querySelector('#downloadImage');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Downloaded!`;
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '#CB6015';
        }, 2000);
    });
    
    // Copy image to clipboard
    content.querySelector('#copyImage').addEventListener('click', async () => {
        try {
            if (navigator.clipboard && ClipboardItem) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': imageBlob
                    })
                ]);
                
                // Show success message
                const btn = content.querySelector('#copyImage');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> <span>Copied!</span>`;
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                }, 2000);
            } else {
                alert('Copy to clipboard not supported in this browser. Please use Download instead.');
            }
        } catch (error) {
            console.error('Failed to copy image:', error);
            alert('Failed to copy image. Please use Download instead.');
        }
    });
    
    // Post to X (Twitter) - Opens composer with text and URL
    content.querySelector('#postTwitter').addEventListener('click', () => {
        const postText = `${shareText} 📊\n\nCheck out this economic data from UT Tyler Hibbs Institute`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}&url=${encodeURIComponent(dashboardUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=600');
        
        // Show tip
        showSocialTip(content, 'Download the image first, then attach it to your post on X');
    });
    
    // Post to LinkedIn - Opens share dialog
    content.querySelector('#postLinkedIn').addEventListener('click', () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dashboardUrl)}`;
        window.open(linkedInUrl, '_blank', 'width=550,height=600');
        
        // Show tip
        showSocialTip(content, 'Download the image first, then attach it to your LinkedIn post');
    });
    
    // Post to Facebook - Opens share dialog
    content.querySelector('#postFacebook').addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dashboardUrl)}`;
        window.open(facebookUrl, '_blank', 'width=550,height=600');
        
        // Show tip
        showSocialTip(content, 'Download the image first, then attach it to your Facebook post');
    });
}

function showSocialTip(content, message) {
    const existingTip = content.querySelector('.social-tip');
    if (existingTip) existingTip.remove();
    
    const tip = document.createElement('div');
    tip.className = 'social-tip';
    tip.style.cssText = 'margin-top: 12px; padding: 10px 12px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; font-size: 12px; color: #78350f; text-align: center;';
    tip.innerHTML = `💡 ${message}`;
    content.querySelector('#closeModal').parentElement.insertAdjacentElement('beforebegin', tip);
    
    setTimeout(() => {
        if (tip.parentElement) tip.remove();
    }, 8000);
}

function fallbackShareMortgage(image30Url, image15Url, blob30, blob15, shareText, dashboardUrl) {
    // Create modal for share options
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 16px;
        overflow-y: auto;
    `;
    
    const content = document.createElement('div');
    const isMobile = window.innerWidth <= 640;
    content.style.cssText = `
        background: white;
        border-radius: ${isMobile ? '12px' : '14px'};
        padding: ${isMobile ? '20px' : '24px'};
        max-width: 600px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    const buttonStyle = isMobile 
        ? 'padding: 12px 10px; background: {bg}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; touch-action: manipulation;'
        : 'padding: 10px 12px; background: {bg}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;';
    
    content.innerHTML = `
        <h3 style="margin: 0 0 ${isMobile ? '12px' : '16px'} 0; color: #0f172a; font-size: ${isMobile ? '1.1rem' : '1.25rem'};">Share Mortgage Rates</h3>
        <div style="margin-bottom: ${isMobile ? '16px' : '20px'};">
            <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: #475569;">30-Year Rate</h4>
            <img src="${image30Url}" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 16px;" alt="30-year mortgage rates chart">
            
            <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: #475569;">15-Year Rate</h4>
            <img src="${image15Url}" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;" alt="15-year mortgage rates chart">
        </div>
        <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(130px, 1fr))'}; gap: ${isMobile ? '12px' : '10px'};">
            <button id="postTwitter" style="${buttonStyle.replace('{bg}', '#000000')}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="vertical-align: middle; ${isMobile ? '' : 'margin-right: 4px;'}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>Post to X</span>
            </button>
            <button id="postLinkedIn" style="${buttonStyle.replace('{bg}', '#0A66C2')}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="vertical-align: middle; ${isMobile ? '' : 'margin-right: 4px;'}"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
                <span>Post to LinkedIn</span>
            </button>
            <button id="postFacebook" style="${buttonStyle.replace('{bg}', '#1877F2')}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="vertical-align: middle; ${isMobile ? '' : 'margin-right: 4px;'}"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Post to Facebook</span>
            </button>
            <button id="postInstagram" style="padding: ${isMobile ? '12px 10px' : '10px 12px'}; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: ${isMobile ? '48px' : 'auto'}; touch-action: manipulation;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="vertical-align: middle; ${isMobile ? '' : 'margin-right: 4px;'}"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span>Save for Instagram</span>
            </button>
        </div>
        <div style="margin-top: 12px; display: ${isMobile ? 'flex' : 'flex'}; flex-direction: ${isMobile ? 'column' : 'row'}; gap: ${isMobile ? '10px' : '8px'};">
            <button id="downloadImage" style="flex: 1; padding: ${isMobile ? '12px' : '10px 12px'}; background: #CB6015; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; min-height: ${isMobile ? '48px' : 'auto'}; touch-action: manipulation;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Both
            </button>
            <button id="closeModal" style="flex: 1; padding: ${isMobile ? '12px' : '10px 12px'}; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; min-height: ${isMobile ? '48px' : 'auto'}; touch-action: manipulation;">
                Close
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Close button
    content.querySelector('#closeModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Post to X (Twitter)
    content.querySelector('#postTwitter').addEventListener('click', () => {
        const postText = `${shareText} 📊\n\nCheck out mortgage rate trends from UT Tyler Hibbs Institute`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}&url=${encodeURIComponent(dashboardUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=600');
    });
    
    // Post to LinkedIn
    content.querySelector('#postLinkedIn').addEventListener('click', () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dashboardUrl)}`;
        window.open(linkedInUrl, '_blank', 'width=550,height=600');
    });
    
    // Post to Facebook
    content.querySelector('#postFacebook').addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dashboardUrl)}`;
        window.open(facebookUrl, '_blank', 'width=550,height=600');
    });
    
    // Instagram - Download both images
    content.querySelector('#postInstagram').addEventListener('click', () => {
        // Download 30-year chart
        const a1 = document.createElement('a');
        a1.href = URL.createObjectURL(blob30);
        a1.download = `mortgage_30year_instagram_${new Date().toISOString().split('T')[0]}.png`;
        a1.click();
        URL.revokeObjectURL(a1.href);
        
        // Download 15-year chart
        setTimeout(() => {
            const a2 = document.createElement('a');
            a2.href = URL.createObjectURL(blob15);
            a2.download = `mortgage_15year_instagram_${new Date().toISOString().split('T')[0]}.png`;
            a2.click();
            URL.revokeObjectURL(a2.href);
        }, 300);
        
        // Show Instagram instructions
        const tip = document.createElement('div');
        tip.style.cssText = 'margin-top: 12px; padding: 10px 12px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; font-size: 12px; color: #78350f; text-align: center;';
        tip.innerHTML = '✓ Images saved! Open Instagram app and upload from your gallery.';
        content.querySelector('#closeModal').parentElement.insertAdjacentElement('beforebegin', tip);
        
        setTimeout(() => {
            if (tip.parentElement) tip.remove();
        }, 8000);
    });
    
    // Download images - download both charts separately
    content.querySelector('#downloadImage').addEventListener('click', () => {
        // Download 30-year chart
        const a1 = document.createElement('a');
        a1.href = URL.createObjectURL(blob30);
        a1.download = `mortgage_30year_${new Date().toISOString().split('T')[0]}.png`;
        a1.click();
        URL.revokeObjectURL(a1.href);
        
        // Download 15-year chart with a slight delay
        setTimeout(() => {
            const a2 = document.createElement('a');
            a2.href = URL.createObjectURL(blob15);
            a2.download = `mortgage_15year_${new Date().toISOString().split('T')[0]}.png`;
            a2.click();
            URL.revokeObjectURL(a2.href);
        }, 300);
        
        // Show success message
        const btn = content.querySelector('#downloadImage');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Downloaded!`;
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '#CB6015';
        }, 2000);
    });
}

function setupTabs() {
    // Main tab handling
    const mainTabBtns = document.querySelectorAll('.main-tab-btn');
    const subTabsContainers = document.querySelectorAll('.sub-tabs-container');
    
    console.log('Setting up main tabs. Found', mainTabBtns.length, 'main tab buttons');
    
    mainTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const mainTabId = btn.dataset.mainTab;
            console.log('Main tab clicked:', mainTabId);
            
            // Remove active from all main tabs
            mainTabBtns.forEach(b => b.classList.remove('active'));
            
            // Hide all sub-tab containers
            subTabsContainers.forEach(c => c.classList.remove('active'));
            
            // Activate clicked main tab
            btn.classList.add('active');
            
            // Show corresponding sub-tabs
            const targetSubTabs = document.getElementById(`${mainTabId}-tabs`);
            if (targetSubTabs) {
                targetSubTabs.classList.add('active');
                
                // Trigger click on first active sub-tab to show content
                const activeSubTab = targetSubTabs.querySelector('.sub-tab-btn.active');
                if (activeSubTab) {
                    activeSubTab.click();
                }
            }
        });
    });
    
    // Sub-tab handling
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Setting up sub tabs. Found', subTabBtns.length, 'sub tab buttons and', tabContents.length, 'content areas');
    
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = btn.dataset.tab;
            console.log('Sub tab clicked:', tabId);
            
            // Remove active from all sub-tabs in this container
            const parentNav = btn.closest('.sub-tab-nav');
            parentNav.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
            
            // Hide all tab contents
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Activate clicked sub-tab and content
            btn.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log('Activated tab:', tabId);
                
                // Trigger chart rendering for specific tabs with lazy loading
                if (cachedData) {
                    const filtered = filterData();
                    
                    if (tabId === 'gdp' || tabId === 'cpi') {
                        renderCharts(filtered);
                    } else if (tabId === 'unemployment') {
                        renderUnemploymentChart(filtered);
                    } else if (tabId === 'nonfarm-employment') {
                        renderPayemsChart(filtered);
                    } else if (tabId === 'mortgage-rates') {
                        if (!mortgageLoaded) {
                            mortgageLoaded = true;
                            showLoadingIndicator('mortgage rates');
                            loadMortgageData()
                                .then(() => {
                                    console.log('Mortgage data loaded, rendering charts...');
                                    renderMortgageCharts();
                                    hideLoadingIndicator();
                                })
                                .catch(error => {
                                    console.error('Error loading mortgage data:', error);
                                    hideLoadingIndicator();
                                });
                        } else {
                            renderMortgageCharts();
                        }
                    } else if (tabId === 'median-home-price') {
                        if (!medianPriceLoaded) {
                            medianPriceLoaded = true;
                            showLoadingIndicator('median price');
                            loadMedianPriceData().then(() => {
                                renderMedianPriceChart();
                                hideLoadingIndicator();
                            });
                        } else {
                            renderMedianPriceChart();
                        }
                    } else if (tabId === 'sales-tax') {
                        if (!salesTaxLoaded) {
                            salesTaxLoaded = true;
                            showLoadingIndicator('sales tax');
                            loadSalesTaxData().then(() => {
                                renderSalesTaxChart();
                                hideLoadingIndicator();
                            });
                        } else {
                            renderSalesTaxChart();
                        }
                    } else if (tabId === 'employment') {
                        if (!employmentLoaded) {
                            employmentLoaded = true;
                            showLoadingIndicator('employment data');
                            loadEmploymentData()
                                .then(() => {
                                    console.log('Employment data loaded, rendering chart...');
                                    renderEmploymentChart();
                                    hideLoadingIndicator();
                                })
                                .catch(error => {
                                    console.error('Error loading employment data:', error);
                                    hideLoadingIndicator();
                                });
                        } else {
                            renderEmploymentChart();
                        }
                    }
                }
            } else {
                console.error('Could not find tab content with id:', tabId);
            }
        });
    });
}

function init() {
    // Validate required data sources are loaded
    if (!validateDataSources()) {
        console.error('Failed to load required data sources');
        return;
    }
    
    registerPlugins();
    ensureDefaults();
    wireEvents();
    setupTabs();
    setupShareButtons();
    
    document.body.classList.add('is-loading');

    // Load main data with 15-second timeout before showing fallback
    const dataLoadPromise = loadData();
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            if (!cachedData || !cachedData.gdp || cachedData.gdp.length === 0) {
                console.warn('Data load taking longer than expected, ensuring fallback is ready...');
                // Transform SAMPLE_DATA unemployment to match the live format (us/texas/tyler fields)
                const transformedSampleData = {
                    ...SAMPLE_DATA,
                    unemployment: SAMPLE_DATA.unemployment.map(d => ({
                        date: d.date,
                        us: d.value,
                        texas: null,
                        tyler: null
                    }))
                };
                cachedData = transformedSampleData;
                dataSource = 'sample';
                setStatus('⚠️ Using sample data - Live APIs loading...', 'warn');
                renderCharts(filterData());
            }
            resolve();
        }, 15000);
    });
    
    Promise.race([dataLoadPromise, timeoutPromise]).catch(err => {
        console.error('Data load error:', err);
    });
    
    // Initialize tax revenue chart from Excel data
    if (typeof initTaxChart === 'function') {
        initTaxChart().catch(error => {
            console.error('Tax chart initialization failed:', error);
        });
    }

    console.log('Dashboard initialized successfully');
}



if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}







