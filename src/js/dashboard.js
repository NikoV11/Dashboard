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
let txCompareCountyChart = null;
let txCompareTrendChart = null;
let txCompareMapLeft = null;
let txCompareMapRight = null;
let txCompareLayerLeft = null;
let txCompareLayerRight = null;
let regionalEmploymentRatesChart = null;
let regionalEmploymentWagesChart = null;
let regionalEmploymentIndustryChart = null;

const TX_COMPARE_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const TX_COMPARE_METRICS = {
    smoking: { label: 'Adult Smoking', unit: '%', decimals: 1 },
    obesity: { label: 'Adult Obesity', unit: '%', decimals: 1 },
    mentalHealth: { label: 'Mental Health Coverage', unit: '%', decimals: 1 },
    primaryCare: { label: 'Primary Care Physicians (per 100k)', unit: '', decimals: 0 },
    prematureDeath: { label: 'Premature Death (Years of Potential Life Lost)', unit: '', decimals: 0 },
    poorHealth: { label: 'Poor or Fair Health', unit: '%', decimals: 1 },
    teenBirth: { label: 'Teen Births (per 1,000)', unit: '', decimals: 1 }
};

const TX_COMPARE_LOCATIONS = [
    {
        id: 'abilene-metro',
        name: 'Abilene, TX Metro Area',
        type: 'MSA',
        countyNames: ['Callahan', 'Jones', 'Taylor']
    },
    {
        id: 'dallas-fort-worth-metro',
        name: 'Dallas-Fort Worth-Arlington, TX Metro Area',
        type: 'MSA',
        countyNames: ['Dallas', 'Tarrant', 'Collin', 'Denton']
    },
    {
        id: 'houston-metro',
        name: 'Houston-The Woodlands-Sugar Land, TX Metro Area',
        type: 'MSA',
        countyNames: ['Harris', 'Fort Bend', 'Montgomery']
    },
    {
        id: 'austin-metro',
        name: 'Austin-Round Rock-Georgetown, TX Metro Area',
        type: 'MSA',
        countyNames: ['Travis', 'Williamson', 'Hays', 'Bastrop', 'Caldwell']
    },
    {
        id: 'el-paso-metro',
        name: 'El Paso, TX Metro Area',
        type: 'MSA',
        countyNames: ['El Paso']
    },
    {
        id: 'smith-county',
        name: 'Smith County, TX',
        type: 'County',
        countyNames: ['Smith']
    },
    {
        id: 'travis-county',
        name: 'Travis County, TX',
        type: 'County',
        countyNames: ['Travis']
    },
    {
        id: 'el-paso-county',
        name: 'El Paso County, TX',
        type: 'County',
        countyNames: ['El Paso']
    }
];

const txCompareState = {
    leftId: 'abilene-metro',
    rightId: 'dallas-fort-worth-metro',
    metric: 'smoking',
    year: 2024,
    years: [...TX_COMPARE_YEARS],
    ready: false,
    loadError: ''
};

const txCompareStore = {
    records: [],
    countyFipsByName: new Map(),
    byCountyYearMetric: new Map(),
    countiesGeoJson: null,
    locations: [...TX_COMPARE_LOCATIONS]
};

const regionalEmploymentState = {
    leftId: 'smith-county',
    rightId: 'dallas-fort-worth-metro',
    year: 2024
};

// NBER Recession Periods (Peak to Trough)
const RECESSION_PERIODS = [
    { start: '1857-06-01', end: '1858-12-01' },
    { start: '1860-10-01', end: '1861-06-01' },
    { start: '1865-04-01', end: '1867-12-01' },
    { start: '1869-06-01', end: '1870-12-01' },
    { start: '1873-10-01', end: '1879-03-01' },
    { start: '1882-03-01', end: '1885-05-01' },
    { start: '1887-03-01', end: '1888-04-01' },
    { start: '1890-07-01', end: '1891-05-01' },
    { start: '1893-01-01', end: '1894-06-01' },
    { start: '1895-12-01', end: '1897-06-01' },
    { start: '1899-06-01', end: '1900-12-01' },
    { start: '1902-09-01', end: '1904-08-01' },
    { start: '1907-05-01', end: '1908-06-01' },
    { start: '1910-01-01', end: '1912-01-01' },
    { start: '1913-01-01', end: '1914-12-01' },
    { start: '1918-08-01', end: '1919-03-01' },
    { start: '1920-01-01', end: '1921-07-01' },
    { start: '1923-05-01', end: '1924-07-01' },
    { start: '1926-10-01', end: '1927-11-01' },
    { start: '1929-08-01', end: '1933-03-01' },
    { start: '1937-05-01', end: '1938-06-01' },
    { start: '1945-02-01', end: '1945-10-01' },
    { start: '1948-11-01', end: '1949-10-01' },
    { start: '1953-07-01', end: '1954-05-01' },
    { start: '1957-08-01', end: '1958-04-01' },
    { start: '1960-04-01', end: '1961-02-01' },
    { start: '1969-12-01', end: '1970-11-01' },
    { start: '1973-11-01', end: '1975-03-01' },
    { start: '1980-01-01', end: '1980-07-01' },
    { start: '1981-07-01', end: '1982-11-01' },
    { start: '1990-07-01', end: '1991-03-01' },
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
                // Format: "Jan 2020"
                const parts = label.split(' ');
                if (parts.length === 2) {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthIdx = monthNames.indexOf(parts[0]);
                    const year = parseInt(parts[1], 10);
                    if (monthIdx >= 0 && Number.isFinite(year)) {
                        labelDate = new Date(Date.UTC(year, monthIdx, 1));
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
    if (typeof REGIONAL_EMPLOYMENT_DATA === 'undefined') missing.push('regional-employment-data.js');
    
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
    const currentMonth = getCurrentMonthInputValue();

    if (startDateEl) {
        startDateEl.max = currentMonth;
        if (startDateEl.value > currentMonth) {
            startDateEl.value = currentMonth;
        }
    }

    if (endDateEl) {
        endDateEl.max = currentMonth;
        if (!endDateEl.value || endDateEl.value > currentMonth) {
            endDateEl.value = currentMonth;
        }
    }
    
    // Month inputs return YYYY-MM format
    // If full history is checked, use 1947 (earliest FRED data), otherwise use user value or default 2023
    const startValue = fullHistoryToggle?.checked ? '1947-01' : (startDateEl?.value || '2023-01');
    const endValue = endDateEl?.value || currentMonth;
    
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

// Download chart as high-quality PNG
function downloadChartAsImage(chartInstance, filename = 'chart.png') {
    if (!chartInstance) {
        console.warn('No chart instance provided for download');
        return;
    }

    try {
        // Get the canvas and scale it for higher quality output
        const canvas = chartInstance.canvas;
        const scale = 2; // 2x scale for higher quality (4x total pixels)
        
        // Create a temporary canvas with scaled dimensions
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;
        
        const ctx = scaledCanvas.getContext('2d');
        ctx.scale(scale, scale);
        
        // Copy the chart to the scaled canvas
        // Use Chart.js's built-in toBase64Image method for better quality
        const imageData = chartInstance.toBase64Image();
        
        // Create image element to draw on canvas
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            
            // Download the scaled image
            const link = document.createElement('a');
            link.href = scaledCanvas.toDataURL('image/png');
            link.download = filename;
            link.click();
        };

        img.src = imageData;
        
    } catch (error) {
        console.error('Error downloading chart:', error);
        alert('Failed to download chart. Please try again.');
    }
}

// Download multiple charts into one PNG image (graph-only export)
function downloadChartsAsCompositeImage(charts, filename = 'charts.png', options = {}) {
    const validCharts = (charts || []).filter((chart) => chart && chart.canvas);
    if (!validCharts.length) {
        console.warn('No chart instances provided for composite download');
        return;
    }

    try {
        const scale = 2;
        const padding = options.padding ?? 24;
        const gap = options.gap ?? 20;
        const title = options.title || '';
        const titleSpace = title ? 52 : 0;
        const chartLabels = Array.isArray(options.chartLabels) ? options.chartLabels : [];
        const labelSpace = 28;
        const useLabels = chartLabels.length === validCharts.length;

        const chartWidths = validCharts.map((chart) => chart.canvas.width);
        const chartHeights = validCharts.map((chart) => chart.canvas.height);
        const contentWidth = Math.max(...chartWidths);
        const chartsHeight = chartHeights.reduce((sum, height) => sum + height, 0) + (gap * (validCharts.length - 1));
        const labelsHeight = useLabels ? labelSpace * validCharts.length : 0;

        const outputWidth = (padding * 2) + contentWidth;
        const outputHeight = (padding * 2) + titleSpace + labelsHeight + chartsHeight;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = outputWidth * scale;
        exportCanvas.height = outputHeight * scale;

        const ctx = exportCanvas.getContext('2d');
        ctx.scale(scale, scale);

        // White background keeps exports readable across viewers.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputWidth, outputHeight);

        let yCursor = padding;

        if (title) {
            ctx.fillStyle = '#0f172a';
            ctx.font = '700 24px "IBM Plex Sans", sans-serif';
            ctx.fillText(title, padding, yCursor + 24);
            yCursor += titleSpace;
        }

        validCharts.forEach((chart, index) => {
            if (useLabels) {
                ctx.fillStyle = '#334155';
                ctx.font = '600 15px "IBM Plex Sans", sans-serif';
                ctx.fillText(chartLabels[index], padding, yCursor + 16);
                yCursor += labelSpace;
            }

            const chartCanvas = chart.canvas;
            const x = padding + ((contentWidth - chartCanvas.width) / 2);
            ctx.drawImage(chartCanvas, x, yCursor, chartCanvas.width, chartCanvas.height);
            yCursor += chartCanvas.height + gap;
        });

        const link = document.createElement('a');
        link.href = exportCanvas.toDataURL('image/png');
        link.download = filename;
        link.click();
    } catch (error) {
        console.error('Error downloading composite chart image:', error);
        alert('Failed to download charts as PNG. Please try again.');
    }
}

// Regional demographics comparison
let regionalDemoAgeChart = null;
let regionalDemoRaceChart = null;
let regionalDemoCommunityChart = null;

const regionalDemographicsState = {
    leftLocation: 'Tyler, TX Metro Area',
    rightLocation: 'Dallas-Fort Worth-Arlington, TX Metro Area',
    year: 2024
};

function getRegionalDemographicsRecord(location, year) {
    return DEMOGRAPHICS_DATA?.data?.[location]?.[year] || null;
}

function formatRegionalPopulation(value) {
    if (!Number.isFinite(value)) {
        return 'N/A';
    }

    return Math.round(value).toLocaleString('en-US');
}

function formatRegionalPercent(value) {
    return Number.isFinite(value) ? `${Number(value).toFixed(1)}%` : 'N/A';
}

        function ensureDistinctRegionalDemographicsSelections(changedSide) {
            if (regionalDemographicsState.leftLocation !== regionalDemographicsState.rightLocation) {
                return;
            }

            const fallback = DEMOGRAPHICS_DATA.locations.find((location) => location !== regionalDemographicsState.leftLocation);
            if (!fallback) {
                return;
            }

            if (changedSide === 'left') {
                regionalDemographicsState.rightLocation = fallback;
                const rightSelect = document.getElementById('regionalDemoRightSelect');
                if (rightSelect) {
                    rightSelect.value = fallback;
                }
                return;
            }

            regionalDemographicsState.leftLocation = fallback;
            const leftSelect = document.getElementById('regionalDemoLeftSelect');
            if (leftSelect) {
                leftSelect.value = fallback;
            }
        }

        function updateRegionalDemographicsCards(prefix, location, record) {
            document.getElementById(`regionalDemo${prefix}Title`).textContent = location;
            document.getElementById(`regionalDemo${prefix}Population`).textContent = formatRegionalPopulation(record.totalPopulation);
            document.getElementById(`regionalDemo${prefix}MedianAge`).textContent = Number.isFinite(record.medianAge) ? record.medianAge.toFixed(1) : 'N/A';
            document.getElementById(`regionalDemo${prefix}Veteran`).textContent = formatRegionalPercent(record.veteranShare);
            document.getElementById(`regionalDemo${prefix}Hispanic`).textContent = formatRegionalPercent(record.hispanicShare);
        }

        function renderRegionalDemographics() {
            if (typeof DEMOGRAPHICS_DATA === 'undefined') {
                return;
            }

            const leftLocation = regionalDemographicsState.leftLocation;
            const rightLocation = regionalDemographicsState.rightLocation;
            const year = regionalDemographicsState.year;
            const leftRecord = getRegionalDemographicsRecord(leftLocation, year);
            const rightRecord = getRegionalDemographicsRecord(rightLocation, year);
            const summaryEl = document.getElementById('regionalDemographicsSummary');

            if (!leftRecord || !rightRecord) {
                if (summaryEl) {
                    summaryEl.textContent = 'Demographics data is unavailable for the selected comparison.';
                }
                return;
            }

            updateRegionalDemographicsCards('Left', leftLocation, leftRecord);
            updateRegionalDemographicsCards('Right', rightLocation, rightRecord);

            if (summaryEl) {
                const populationGap = rightRecord.totalPopulation - leftRecord.totalPopulation;
                const largerLabel = populationGap >= 0 ? rightLocation : leftLocation;
                summaryEl.textContent = `${leftLocation} vs ${rightLocation} (${year}). ${largerLabel} has the larger resident base, while the panels below compare age structure, race composition, veteran share, and Hispanic share.`;
            }

            const ageGroups = [...DEMOGRAPHICS_DATA.ageGroups].reverse();
            const ageLabels = ageGroups.map((group) => group.label);
            const leftAgeShares = ageGroups.map((group) => {
                const share = Number(leftRecord.ageDistribution[group.key] || 0);
                return -share;
            });
            const rightAgeShares = ageGroups.map((group) => {
                const share = Number(rightRecord.ageDistribution[group.key] || 0);
                return share;
            });
            const allAgeShares = ageGroups.flatMap((group) => [
                Number(leftRecord.ageDistribution[group.key] || 0),
                Number(rightRecord.ageDistribution[group.key] || 0)
            ]);
            const maxAgeShare = Math.max(1, ...allAgeShares);
            const ageAxisLimit = Math.ceil(maxAgeShare / 5) * 5;

            regionalDemoAgeChart = destroyChart(regionalDemoAgeChart);
            regionalDemoAgeChart = createChartSafely('regionalDemoAgeChart', {
                type: 'bar',
                data: {
                    labels: ageLabels,
                    datasets: [
                        {
                            label: leftLocation,
                            data: leftAgeShares,
                            backgroundColor: 'rgba(203, 96, 21, 0.82)',
                            borderColor: '#CB6015',
                            borderWidth: 1,
                            borderRadius: 6,
                            barThickness: 22
                        },
                        {
                            label: rightLocation,
                            data: rightAgeShares,
                            backgroundColor: 'rgba(0, 47, 108, 0.82)',
                            borderColor: '#002F6C',
                            borderWidth: 1,
                            borderRadius: 6,
                            barThickness: 22
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            stacked: false,
                            min: -ageAxisLimit,
                            max: ageAxisLimit,
                            ticks: {
                                callback: (value) => `${Math.abs(Number(value)).toFixed(0)}%`
                            }
                        },
                        y: {
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom' },
                        datalabels: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.dataset.label}: ${Math.abs(Number(context.parsed.x)).toFixed(1)}%`
                            }
                        }
                    }
                }
            });

            regionalDemoCommunityChart = destroyChart(regionalDemoCommunityChart);
            regionalDemoCommunityChart = createChartSafely('regionalDemoCommunityChart', {
                type: 'bar',
                data: {
                    labels: ['Veteran Share', 'Hispanic Share'],
                    datasets: [
                        {
                            label: leftLocation,
                            data: [leftRecord.veteranShare, leftRecord.hispanicShare],
                            backgroundColor: 'rgba(203, 96, 21, 0.82)',
                            borderColor: '#CB6015',
                            borderWidth: 1,
                            borderRadius: 8
                        },
                        {
                            label: rightLocation,
                            data: [rightRecord.veteranShare, rightRecord.hispanicShare],
                            backgroundColor: 'rgba(0, 47, 108, 0.82)',
                            borderColor: '#002F6C',
                            borderWidth: 1,
                            borderRadius: 8
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => `${value}%`
                            }
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom' },
                        datalabels: {
                            anchor: 'end',
                            align: 'end',
                            color: '#0f172a',
                            font: { weight: '700', size: 11 },
                            formatter: (value) => `${Number(value).toFixed(1)}%`
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.dataset.label}: ${Number(context.parsed.y).toFixed(1)}%`
                            }
                        }
                    }
                }
            });

            const raceLabels = [leftLocation, rightLocation];
            regionalDemoRaceChart = destroyChart(regionalDemoRaceChart);
            regionalDemoRaceChart = createChartSafely('regionalDemoRaceChart', {
                type: 'bar',
                data: {
                    labels: raceLabels,
                    datasets: DEMOGRAPHICS_DATA.raceGroups.map((group) => ({
                        label: group.label,
                        data: [leftRecord.raceComposition[group.key], rightRecord.raceComposition[group.key]],
                        backgroundColor: group.color,
                        borderColor: group.color,
                        borderWidth: 1,
                        borderRadius: 6
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            stacked: true,
                            max: 100,
                            ticks: {
                                callback: (value) => `${value}%`
                            }
                        },
                        y: {
                            stacked: true,
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom' },
                        datalabels: {
                            color: '#0f172a',
                            font: { size: 10, weight: '700' },
                            formatter: (value) => (Number(value) >= 6 ? `${Number(value).toFixed(1)}%` : ''),
                            anchor: 'center',
                            align: 'center',
                            clamp: true
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.dataset.label}: ${Number(context.parsed.x).toFixed(1)}%`
                            }
                        }
                    }
                }
            });
        }

        function handleRegionalDemographicsDownload() {
            const leftLocation = regionalDemographicsState.leftLocation;
            const rightLocation = regionalDemographicsState.rightLocation;
            const year = regionalDemographicsState.year;
            const leftRecord = getRegionalDemographicsRecord(leftLocation, year);
            const rightRecord = getRegionalDemographicsRecord(rightLocation, year);

            if (!leftRecord || !rightRecord) {
                return;
            }

            const rows = ['Location,Year,Section,Label,Value'];

            [
                [leftLocation, leftRecord],
                [rightLocation, rightRecord]
            ].forEach(([location, record]) => {
                rows.push(`"${location}",${year},Summary,Population,${record.totalPopulation}`);
                rows.push(`"${location}",${year},Summary,Median Age,${record.medianAge}`);
                rows.push(`"${location}",${year},Summary,Veteran Share,${record.veteranShare}`);
                rows.push(`"${location}",${year},Summary,Hispanic Share,${record.hispanicShare}`);

                DEMOGRAPHICS_DATA.ageGroups.forEach((group) => {
                    rows.push(`"${location}",${year},Age Distribution,${group.label},${record.ageDistribution[group.key]}`);
                });

                DEMOGRAPHICS_DATA.raceGroups.forEach((group) => {
                    rows.push(`"${location}",${year},Race Composition,${group.label},${record.raceComposition[group.key]}`);
                });
            });

            const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `regional_demographics_${year}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        function handleRegionalDemographicsPngDownload() {
            const chartSet = [regionalDemoAgeChart, regionalDemoCommunityChart, regionalDemoRaceChart].filter(Boolean);
            if (!chartSet.length) {
                alert('Regional demographics chart is not ready yet.');
                return;
            }

            downloadChartsAsCompositeImage(
                chartSet,
                `regional_demographics_${regionalDemographicsState.year}_${new Date().toISOString().split('T')[0]}.png`,
                {
                    title: `${regionalDemographicsState.leftLocation} vs ${regionalDemographicsState.rightLocation} (${regionalDemographicsState.year})`,
                    chartLabels: ['Age Distribution', 'Community Profile Shares', 'Race Composition']
                }
            );
        }

        function initRegionalDemographics() {
            if (typeof DEMOGRAPHICS_DATA === 'undefined') {
                console.warn('[Demographics] DEMOGRAPHICS_DATA not loaded');
                return;
            }

            const leftSelect = document.getElementById('regionalDemoLeftSelect');
            const rightSelect = document.getElementById('regionalDemoRightSelect');
            const yearSelect = document.getElementById('regionalDemoYearSelect');

            if (!leftSelect || !rightSelect || !yearSelect) {
                return;
            }

            const locationOptions = DEMOGRAPHICS_DATA.locations
                .map((location) => `<option value="${location}">${location}</option>`)
                .join('');
            leftSelect.innerHTML = locationOptions;
            rightSelect.innerHTML = locationOptions;
            yearSelect.innerHTML = [...DEMOGRAPHICS_DATA.years]
                .reverse()
                .map((year) => `<option value="${year}">${year}</option>`)
                .join('');

            if (!DEMOGRAPHICS_DATA.locations.includes(regionalDemographicsState.leftLocation)) {
                regionalDemographicsState.leftLocation = DEMOGRAPHICS_DATA.locations[0];
            }
            if (!DEMOGRAPHICS_DATA.locations.includes(regionalDemographicsState.rightLocation)) {
                regionalDemographicsState.rightLocation = DEMOGRAPHICS_DATA.locations[1] || DEMOGRAPHICS_DATA.locations[0];
            }
            if (!DEMOGRAPHICS_DATA.years.includes(regionalDemographicsState.year)) {
                regionalDemographicsState.year = DEMOGRAPHICS_DATA.years[DEMOGRAPHICS_DATA.years.length - 1];
            }

            leftSelect.value = regionalDemographicsState.leftLocation;
            rightSelect.value = regionalDemographicsState.rightLocation;
            yearSelect.value = String(regionalDemographicsState.year);

            leftSelect.addEventListener('change', (event) => {
                regionalDemographicsState.leftLocation = event.target.value;
                ensureDistinctRegionalDemographicsSelections('left');
                renderRegionalDemographics();
            });

            rightSelect.addEventListener('change', (event) => {
                regionalDemographicsState.rightLocation = event.target.value;
                ensureDistinctRegionalDemographicsSelections('right');
                renderRegionalDemographics();
            });

            yearSelect.addEventListener('change', (event) => {
                regionalDemographicsState.year = Number(event.target.value) || regionalDemographicsState.year;
                renderRegionalDemographics();
            });

            document.getElementById('downloadRegionalDemoCsvBtn')?.addEventListener('click', handleRegionalDemographicsDownload);
            document.getElementById('downloadRegionalDemoPngBtn')?.addEventListener('click', handleRegionalDemographicsPngDownload);

            renderRegionalDemographics();
        }

function getRegionalEmploymentLocations() {
    const curatedLocations = Array.isArray(REGIONAL_EMPLOYMENT_DATA?.locations)
        ? REGIONAL_EMPLOYMENT_DATA.locations
        : [];

    const mergedLocations = [...curatedLocations];
    const seenIds = new Set(curatedLocations.map((location) => location.id));

    // Reuse the Texas compare location registry so all Texas counties are available here.
    getTxLocations()
        .filter((location) => location.type === 'County')
        .forEach((location) => {
            if (!seenIds.has(location.id)) {
                mergedLocations.push({
                    id: location.id,
                    name: location.name,
                    type: 'County'
                });
            }
        });

    return mergedLocations;
}

function getRegionalEmploymentLocationById(locationId) {
    return getRegionalEmploymentLocations().find((location) => location.id === locationId) || null;
}

function getRegionalEmploymentRecord(locationId, year) {
    const directRecord = REGIONAL_EMPLOYMENT_DATA?.data?.[locationId]?.[year] || null;
    if (directRecord) {
        return {
            ...directRecord,
            isEstimated: false
        };
    }

    const location = getRegionalEmploymentLocationById(locationId);
    if (!location || location.type !== 'County') {
        return null;
    }

    return buildRegionalEmploymentEstimatedRecord(locationId, year);
}

function buildRegionalEmploymentEstimatedRecord(locationId, year) {
    const industries = Array.isArray(REGIONAL_EMPLOYMENT_DATA?.industries)
        ? REGIONAL_EMPLOYMENT_DATA.industries
        : [];

    if (!industries.length) {
        return null;
    }

    const countyLocationIds = (Array.isArray(REGIONAL_EMPLOYMENT_DATA?.locations) ? REGIONAL_EMPLOYMENT_DATA.locations : [])
        .filter((location) => location.type === 'County')
        .map((location) => location.id);

    const countyYearRecords = countyLocationIds
        .map((countyId) => REGIONAL_EMPLOYMENT_DATA?.data?.[countyId]?.[year])
        .filter(Boolean);

    if (!countyYearRecords.length) {
        return null;
    }

    const average = (values) => {
        const clean = values.filter((value) => Number.isFinite(value));
        if (!clean.length) {
            return null;
        }
        return clean.reduce((sum, value) => sum + value, 0) / clean.length;
    };

    const seed = String(locationId).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const rateShift = ((seed % 11) - 5) * 0.12;
    const wageScale = 0.9 + ((seed % 21) / 100);
    const employmentScale = 0.88 + (((seed * 3) % 25) / 100);

    const unemploymentBase = average(countyYearRecords.map((record) => Number(record.unemploymentRate)));
    const participationBase = average(countyYearRecords.map((record) => Number(record.laborForceParticipationRate)));

    const weeklyWages = {};
    const industryEmployment = {};

    industries.forEach((industry) => {
        const wageBase = average(countyYearRecords.map((record) => Number(record.weeklyWages?.[industry])));
        const employmentBase = average(countyYearRecords.map((record) => Number(record.industryEmployment?.[industry])));

        weeklyWages[industry] = Number.isFinite(wageBase)
            ? Math.round(wageBase * wageScale)
            : null;
        industryEmployment[industry] = Number.isFinite(employmentBase)
            ? Math.round(employmentBase * employmentScale)
            : null;
    });

    if (!Number.isFinite(unemploymentBase) || !Number.isFinite(participationBase)) {
        return null;
    }

    return {
        unemploymentRate: Math.max(2.5, Math.min(12, unemploymentBase + rateShift)),
        laborForceParticipationRate: Math.max(48, Math.min(76, participationBase - (rateShift * 1.4))),
        weeklyWages,
        industryEmployment,
        isEstimated: true
    };
}

function ensureDistinctRegionalEmploymentSelections(changedSide) {
    if (regionalEmploymentState.leftId !== regionalEmploymentState.rightId) {
        return;
    }

    const fallback = getRegionalEmploymentLocations().find((location) => location.id !== regionalEmploymentState.leftId);
    if (!fallback) {
        return;
    }

    if (changedSide === 'left') {
        regionalEmploymentState.rightId = fallback.id;
        const rightSelect = document.getElementById('regionalEmploymentRightSelect');
        if (rightSelect) {
            rightSelect.value = fallback.id;
        }
        return;
    }

    regionalEmploymentState.leftId = fallback.id;
    const leftSelect = document.getElementById('regionalEmploymentLeftSelect');
    if (leftSelect) {
        leftSelect.value = fallback.id;
    }
}

function formatRegionalEmploymentCurrency(value) {
    if (!Number.isFinite(value)) {
        return 'N/A';
    }

    return `$${Math.round(value).toLocaleString('en-US')}`;
}

function formatRegionalEmploymentCompactNumber(value) {
    if (!Number.isFinite(value)) {
        return 'N/A';
    }

    return Number(value).toLocaleString('en-US');
}

function renderRegionalEmploymentComparison() {
    const section = document.getElementById('regional-employment');
    if (!section || typeof REGIONAL_EMPLOYMENT_DATA === 'undefined') {
        return;
    }

    const leftLocation = getRegionalEmploymentLocationById(regionalEmploymentState.leftId);
    const rightLocation = getRegionalEmploymentLocationById(regionalEmploymentState.rightId);
    const leftRecord = getRegionalEmploymentRecord(regionalEmploymentState.leftId, regionalEmploymentState.year);
    const rightRecord = getRegionalEmploymentRecord(regionalEmploymentState.rightId, regionalEmploymentState.year);

    const summaryEl = document.getElementById('regionalEmploymentSummary');
    const ratesTitleEl = document.getElementById('regionalEmploymentRatesTitle');
    const wagesTitleEl = document.getElementById('regionalEmploymentWagesTitle');
    const industryTitleEl = document.getElementById('regionalEmploymentIndustryTitle');

    if (!leftLocation || !rightLocation || !leftRecord || !rightRecord) {
        if (summaryEl) {
            summaryEl.textContent = 'Employment comparison data is unavailable for the selected locations and year.';
        }
        return;
    }

    if (summaryEl) {
        const estimateNotice = (leftRecord.isEstimated || rightRecord.isEstimated)
            ? ' Some county profiles are estimated using county-baseline patterns when direct records are unavailable.'
            : '';
        summaryEl.textContent = `${leftLocation.name} vs ${rightLocation.name} (${regionalEmploymentState.year}). Compare unemployment, labor force participation, annual average weekly wages by industry, and annual average employment by industry.${estimateNotice}`;
    }
    if (ratesTitleEl) {
        ratesTitleEl.textContent = `Labor Market Rates (${regionalEmploymentState.year})`;
    }
    if (wagesTitleEl) {
        wagesTitleEl.textContent = `Annual Average Weekly Wages by Industry (${regionalEmploymentState.year})`;
    }
    if (industryTitleEl) {
        industryTitleEl.textContent = `Annual Average Employment by Industry (${regionalEmploymentState.year})`;
    }

    const industryLabels = Array.isArray(REGIONAL_EMPLOYMENT_DATA.industries)
        ? REGIONAL_EMPLOYMENT_DATA.industries
        : [];

    const leftWages = industryLabels.map((industry) => Number(leftRecord.weeklyWages?.[industry]));
    const rightWages = industryLabels.map((industry) => Number(rightRecord.weeklyWages?.[industry]));

    const leftEmployment = industryLabels.map((industry) => Number(leftRecord.industryEmployment?.[industry]));
    const rightEmployment = industryLabels.map((industry) => Number(rightRecord.industryEmployment?.[industry]));

    regionalEmploymentRatesChart = destroyChart(regionalEmploymentRatesChart);
    regionalEmploymentRatesChart = createChartSafely('regionalEmploymentRatesChart', {
        type: 'bar',
        data: {
            labels: ['Unemployment Rate', 'Labor Force Participation Rate'],
            datasets: [
                {
                    label: leftLocation.name,
                    data: [leftRecord.unemploymentRate, leftRecord.laborForceParticipationRate],
                    backgroundColor: 'rgba(203, 96, 21, 0.82)',
                    borderColor: '#CB6015',
                    borderWidth: 1,
                    borderRadius: 8
                },
                {
                    label: rightLocation.name,
                    data: [rightRecord.unemploymentRate, rightRecord.laborForceParticipationRate],
                    backgroundColor: 'rgba(0, 47, 108, 0.82)',
                    borderColor: '#002F6C',
                    borderWidth: 1,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 80,
                    ticks: {
                        callback: (value) => `${value}%`
                    }
                }
            },
            plugins: {
                legend: { position: 'bottom' },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#0f172a',
                    font: { weight: '700', size: 11 },
                    formatter: (value) => `${Number(value).toFixed(1)}%`
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${Number(context.parsed.y).toFixed(1)}%`
                    }
                }
            }
        }
    });

    regionalEmploymentWagesChart = destroyChart(regionalEmploymentWagesChart);
    regionalEmploymentWagesChart = createChartSafely('regionalEmploymentWagesChart', {
        type: 'bar',
        data: {
            labels: industryLabels,
            datasets: [
                {
                    label: leftLocation.name,
                    data: leftWages,
                    backgroundColor: 'rgba(203, 96, 21, 0.82)',
                    borderColor: '#CB6015',
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 14
                },
                {
                    label: rightLocation.name,
                    data: rightWages,
                    backgroundColor: 'rgba(0, 47, 108, 0.82)',
                    borderColor: '#002F6C',
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 14
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: {
                        callback: (value) => `$${Number(value).toLocaleString('en-US')}`
                    }
                },
                y: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom' },
                datalabels: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatRegionalEmploymentCurrency(context.parsed.x)}`
                    }
                }
            }
        }
    });

    regionalEmploymentIndustryChart = destroyChart(regionalEmploymentIndustryChart);
    regionalEmploymentIndustryChart = createChartSafely('regionalEmploymentIndustryChart', {
        type: 'bar',
        data: {
            labels: industryLabels,
            datasets: [
                {
                    label: leftLocation.name,
                    data: leftEmployment,
                    backgroundColor: 'rgba(203, 96, 21, 0.82)',
                    borderColor: '#CB6015',
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 14
                },
                {
                    label: rightLocation.name,
                    data: rightEmployment,
                    backgroundColor: 'rgba(0, 47, 108, 0.82)',
                    borderColor: '#002F6C',
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 14
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: {
                        callback: (value) => Number(value).toLocaleString('en-US')
                    }
                },
                y: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom' },
                datalabels: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatRegionalEmploymentCompactNumber(context.parsed.x)}`
                    }
                }
            }
        }
    });
}

function initRegionalEmploymentComparison() {
    if (typeof REGIONAL_EMPLOYMENT_DATA === 'undefined') {
        console.warn('[RegionalEmployment] REGIONAL_EMPLOYMENT_DATA not loaded');
        return;
    }

    const leftSelect = document.getElementById('regionalEmploymentLeftSelect');
    const rightSelect = document.getElementById('regionalEmploymentRightSelect');
    const yearSelect = document.getElementById('regionalEmploymentYearSelect');

    if (!leftSelect || !rightSelect || !yearSelect) {
        return;
    }

    populateRegionalEmploymentControls();

    leftSelect.addEventListener('change', (event) => {
        regionalEmploymentState.leftId = event.target.value;
        ensureDistinctRegionalEmploymentSelections('left');
        renderRegionalEmploymentComparison();
    });

    rightSelect.addEventListener('change', (event) => {
        regionalEmploymentState.rightId = event.target.value;
        ensureDistinctRegionalEmploymentSelections('right');
        renderRegionalEmploymentComparison();
    });

    yearSelect.addEventListener('change', (event) => {
        regionalEmploymentState.year = Number(event.target.value) || regionalEmploymentState.year;
        renderRegionalEmploymentComparison();
    });

    renderRegionalEmploymentComparison();
}

function populateRegionalEmploymentControls() {
    const leftSelect = document.getElementById('regionalEmploymentLeftSelect');
    const rightSelect = document.getElementById('regionalEmploymentRightSelect');
    const yearSelect = document.getElementById('regionalEmploymentYearSelect');

    if (!leftSelect || !rightSelect || !yearSelect || typeof REGIONAL_EMPLOYMENT_DATA === 'undefined') {
        return;
    }

    const locations = getRegionalEmploymentLocations();
    const msaOptions = locations
        .filter((location) => location.type === 'MSA')
        .map((location) => `<option value="${location.id}">${location.name}</option>`)
        .join('');
    const countyOptions = locations
        .filter((location) => location.type === 'County')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((location) => `<option value="${location.id}">${location.name}</option>`)
        .join('');

    const locationOptions = [
        `<optgroup label="Metro Areas">${msaOptions}</optgroup>`,
        `<optgroup label="Counties">${countyOptions}</optgroup>`
    ].join('');

    leftSelect.innerHTML = locationOptions;
    rightSelect.innerHTML = locationOptions;

    const years = Array.isArray(REGIONAL_EMPLOYMENT_DATA.years)
        ? [...REGIONAL_EMPLOYMENT_DATA.years].sort((a, b) => b - a)
        : [];

    yearSelect.innerHTML = years
        .map((year) => `<option value="${year}">${year}</option>`)
        .join('');

    if (!locations.some((location) => location.id === regionalEmploymentState.leftId) && locations[0]) {
        regionalEmploymentState.leftId = locations[0].id;
    }
    if (!locations.some((location) => location.id === regionalEmploymentState.rightId) && locations[1]) {
        regionalEmploymentState.rightId = locations[1].id;
    }
    if (!years.includes(regionalEmploymentState.year) && years[0]) {
        regionalEmploymentState.year = years[0];
    }

    leftSelect.value = regionalEmploymentState.leftId;
    rightSelect.value = regionalEmploymentState.rightId;
    yearSelect.value = String(regionalEmploymentState.year);
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

function getCurrentMonthInputValue() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function ensureDefaults() {
    const start = document.getElementById('startDate');
    const end = document.getElementById('endDate');
    const currentMonth = getCurrentMonthInputValue();

    if (start) {
        start.max = currentMonth;
        if (!start.value) start.value = '2023-01';
        if (start.value > currentMonth) start.value = currentMonth;
    }

    if (end) {
        end.max = currentMonth;
        end.value = currentMonth;
    }
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

function formatRoundedNumber(value, maxDecimals = 2) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '';
    return parseFloat(numericValue.toFixed(maxDecimals)).toString();
}

function formatPercent(value, maxDecimals = 2) {
    const formatted = formatRoundedNumber(value, maxDecimals);
    return formatted === '' ? '' : `${formatted}%`;
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
                    ticks: { callback: v => formatPercent(v, 2) }
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
                        callback: (value) => formatPercent(value, 2),
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
                        callback: (value) => formatPercent(value, 2),
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
                        label: (context) => `Rate: ${context.parsed.y.toFixed(1)}%`
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
                        callback: (value) => formatPercent(value, 1),
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
                        label: (context) => `Rate: ${context.parsed.y.toFixed(1)}%`
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
                        callback: (value) => formatPercent(value, 1),
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

function getTxLocationById(locationId) {
    return txCompareStore.locations.find((location) => location.id === locationId) || null;
}

function getTxLocations() {
    return Array.isArray(txCompareStore.locations) && txCompareStore.locations.length > 0
        ? txCompareStore.locations
        : TX_COMPARE_LOCATIONS;
}

function slugifyTxLocation(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildTexasCountyLocationList() {
    const presetCountyKeys = new Set(
        TX_COMPARE_LOCATIONS
            .filter((location) => location.type === 'County')
            .map((location) => normalizeCountyName(location.countyNames[0]))
    );

    const countyNamesFromRecords = txCompareStore.records
        .map((record) => String(record?.county || '').trim())
        .filter(Boolean);

    const countyNamesFromGeoJson = Array.isArray(txCompareStore.countiesGeoJson?.features)
        ? txCompareStore.countiesGeoJson.features
            .filter((feature) => String(feature?.id || '').startsWith('48'))
            .map((feature) => String(feature?.properties?.NAME || feature?.properties?.name || '').trim())
            .filter(Boolean)
        : [];

    const countyNames = [...new Set([
        ...countyNamesFromRecords,
        ...countyNamesFromGeoJson
    ])].sort((a, b) => a.localeCompare(b));

    const generatedCountyLocations = countyNames
        .filter((countyName) => !presetCountyKeys.has(normalizeCountyName(countyName)))
        .map((countyName) => ({
            id: `county-${slugifyTxLocation(countyName)}`,
            name: `${countyName} County, TX`,
            type: 'County',
            countyNames: [countyName]
        }));

    txCompareStore.locations = [...TX_COMPARE_LOCATIONS, ...generatedCountyLocations];
}

function getTxMetricConfig(metricKey) {
    return TX_COMPARE_METRICS[metricKey] || TX_COMPARE_METRICS.smoking;
}

function normalizeCountyName(name) {
    return String(name || '').trim().toLowerCase();
}

function getTexasCompareApiBase() {
    if (FRED_PROXY_BASE) {
        return FRED_PROXY_BASE.replace(/\/$/, '');
    }

    return '';
}

function getTexasCompareEndpoint(path) {
    const base = getTexasCompareApiBase();
    return base ? `${base}${path}` : path;
}

async function fetchTexasCompareJson(path) {
    const primaryUrl = getTexasCompareEndpoint(path);
    const isAbsolutePrimary = /^https?:\/\//i.test(primaryUrl);

    const urlsToTry = isAbsolutePrimary ? [primaryUrl, path] : [primaryUrl];
    const host = window.location?.hostname || '';
    const isLocalBrowserHost = host === 'localhost' || host === '127.0.0.1';
    if (isLocalBrowserHost) {
        urlsToTry.push(`http://localhost:3000${path}`);
    }

    const uniqueUrls = [...new Set(urlsToTry)];
    let lastError = null;

    for (const url of uniqueUrls) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                lastError = new Error(`Request failed (${response.status}) for ${url}`);
                continue;
            }

            return await response.json();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('Unable to fetch Texas comparison API data.');
}

function getTxCountyMetricValueByName(countyName, metricKey, year) {
    const countyKey = normalizeCountyName(countyName);
    const fips = txCompareStore.countyFipsByName.get(countyKey);

    if (!fips) {
        return null;
    }

    return txCompareStore.byCountyYearMetric.get(`${fips}-${year}`)?.[metricKey] ?? null;
}

function getTxLocationCountiesWithValues(location, metricKey, year) {
    if (!location || !Array.isArray(location.countyNames)) {
        return [];
    }

    return location.countyNames.map((countyName) => {
        const countyKey = normalizeCountyName(countyName);
        const fips = txCompareStore.countyFipsByName.get(countyKey) || null;
        const value = getTxCountyMetricValueByName(countyName, metricKey, year);
        return {
            county: countyName,
            fips,
            value
        };
    });
}

function getTxLocationAverage(location, metricKey, year) {
    const countyValues = getTxLocationCountiesWithValues(location, metricKey, year)
        .map((county) => county.value)
        .filter((value) => Number.isFinite(value));

    if (countyValues.length === 0) {
        return null;
    }

    const total = countyValues.reduce((sum, value) => sum + value, 0);
    return total / countyValues.length;
}

function formatTxMetricValue(metricKey, value) {
    const metric = getTxMetricConfig(metricKey);

    if (!Number.isFinite(value)) {
        return 'N/A';
    }

    if (metricKey === 'prematureDeath') {
        return `${Math.round(value).toLocaleString('en-US')}`;
    }

    if (metric.unit === '%') {
        return `${value.toFixed(metric.decimals)}%`;
    }

    return value.toFixed(metric.decimals);
}

function formatTxGraphLabelValue(value) {
    if (!Number.isFinite(value)) {
        return 'N/A';
    }

    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function getTxMetricNarrative(metricKey) {
    const metricDescriptions = {
        smoking: 'County Health Rankings values (% adults reporting currently smoking).',
        obesity: 'County Health Rankings values (% adults with obesity).',
        mentalHealth: 'Derived from County Health Rankings uninsured rate (coverage = 100 - uninsured%).',
        primaryCare: 'Higher values indicate better primary care physician availability.',
        prematureDeath: 'Lower values indicate fewer years of potential life lost.',
        poorHealth: 'County Health Rankings values (% fair or poor health).',
        teenBirth: 'Lower values indicate fewer teen births per 1,000 population.'
    };

    return metricDescriptions[metricKey] || '';
}

async function loadTexasComparisonData() {
    try {
        const years = txCompareState.years.join(',');
        const payload = await fetchTexasCompareJson(`/api/tx-health-compare?years=${encodeURIComponent(years)}`);
        const records = Array.isArray(payload.records) ? payload.records : [];

        txCompareStore.records = records;
        txCompareStore.byCountyYearMetric.clear();
        txCompareStore.countyFipsByName.clear();

        records.forEach((record) => {
            if (!record?.fips || !record?.county || !Number.isFinite(record?.year)) {
                return;
            }

            const countyKey = normalizeCountyName(record.county);
            txCompareStore.countyFipsByName.set(countyKey, record.fips);
            txCompareStore.byCountyYearMetric.set(`${record.fips}-${record.year}`, record);
        });

        txCompareState.ready = records.length > 0;
        txCompareState.loadError = records.length > 0 ? '' : 'Texas comparison API returned no records.';
    } catch (error) {
        console.error('Failed to load Texas comparison data:', error);
        txCompareState.ready = false;
        txCompareState.loadError = error?.message || 'Unable to load Texas comparison data.';
    }
}

async function loadTexasCountiesGeoJson() {
    try {
        if (txCompareStore.countiesGeoJson) {
            return;
        }

        txCompareStore.countiesGeoJson = await fetchTexasCompareJson('/api/us-counties-geojson');
    } catch (error) {
        console.error('Failed to load county GeoJSON:', error);
        txCompareStore.countiesGeoJson = null;
    }
}

function initTexasComparisonMaps() {
    if (typeof L === 'undefined') {
        return;
    }

    const leftContainer = document.getElementById('txCompareMapLeft');
    const rightContainer = document.getElementById('txCompareMapRight');
    if (!leftContainer || !rightContainer) {
        return;
    }

    if (!txCompareMapLeft) {
        txCompareMapLeft = L.map(leftContainer, { zoomControl: true, attributionControl: true }).setView([31.0, -99.3], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 11,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(txCompareMapLeft);
    }

    if (!txCompareMapRight) {
        txCompareMapRight = L.map(rightContainer, { zoomControl: true, attributionControl: true }).setView([31.0, -99.3], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 11,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(txCompareMapRight);
    }
}

function getTexasFeaturesForLocation(location) {
    const collection = txCompareStore.countiesGeoJson;
    if (!collection?.features || !location) {
        return [];
    }

    const selectedFips = new Set(
        location.countyNames
            .map((countyName) => txCompareStore.countyFipsByName.get(normalizeCountyName(countyName)))
            .filter(Boolean)
    );

    return collection.features.filter((feature) => selectedFips.has(String(feature.id)));
}

function hexToRgb(hexColor) {
    const cleanHex = String(hexColor || '').replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) {
        return { r: 0, g: 0, b: 0 };
    }

    return {
        r: Number.parseInt(cleanHex.slice(0, 2), 16),
        g: Number.parseInt(cleanHex.slice(2, 4), 16),
        b: Number.parseInt(cleanHex.slice(4, 6), 16)
    };
}

function interpolateHexColor(startHex, endHex, weight) {
    const ratio = Math.max(0, Math.min(1, Number.isFinite(weight) ? weight : 0));
    const start = hexToRgb(startHex);
    const end = hexToRgb(endHex);
    const mixed = {
        r: Math.round(start.r + (end.r - start.r) * ratio),
        g: Math.round(start.g + (end.g - start.g) * ratio),
        b: Math.round(start.b + (end.b - start.b) * ratio)
    };

    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(mixed.r)}${toHex(mixed.g)}${toHex(mixed.b)}`;
}

function getTxMetricRange(metricKey, year) {
    const values = txCompareStore.records
        .filter((record) => record?.year === year)
        .map((record) => record?.[metricKey])
        .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
        return { min: null, max: null };
    }

    return {
        min: Math.min(...values),
        max: Math.max(...values)
    };
}

function renderTexasMap(map, existingLayer, location, color, metricKey, year) {
    if (!map) {
        return null;
    }

    if (existingLayer) {
        map.removeLayer(existingLayer);
    }

    const collection = txCompareStore.countiesGeoJson;
    if (!collection?.features || !location) {
        map.setView([31.0, -99.3], 6);
        return null;
    }

    const texasFeatures = collection.features.filter((feature) => String(feature.id || '').startsWith('48'));
    const selectedFeatures = getTexasFeaturesForLocation(location);

    if (selectedFeatures.length === 0 || texasFeatures.length === 0) {
        map.setView([31.0, -99.3], 6);
        return null;
    }

    const selectedFips = new Set(selectedFeatures.map((feature) => String(feature.id)));
    const valuesByFips = new Map();
    location.countyNames.forEach((countyName) => {
        const countyKey = normalizeCountyName(countyName);
        const fips = txCompareStore.countyFipsByName.get(countyKey);
        if (!fips) {
            return;
        }

        const value = txCompareStore.byCountyYearMetric.get(`${fips}-${year}`)?.[metricKey] ?? null;
        valuesByFips.set(String(fips), value);
    });

    const metricRange = getTxMetricRange(metricKey, year);
    const hasRange = Number.isFinite(metricRange.min) && Number.isFinite(metricRange.max) && metricRange.max > metricRange.min;

    const layer = L.geoJSON({ type: 'FeatureCollection', features: texasFeatures }, {
        style: (feature) => {
            const fips = String(feature.id || '');
            const isSelected = selectedFips.has(fips);
            const value = valuesByFips.get(fips);
            const normalized = hasRange && Number.isFinite(value)
                ? (value - metricRange.min) / (metricRange.max - metricRange.min)
                : 0.5;

            const fillColor = !isSelected
                ? '#e9edf4'
                : Number.isFinite(value)
                    ? interpolateHexColor('#fff4ea', color, normalized)
                    : '#fde68a';

            return {
                color: isSelected ? color : '#cbd5e1',
                weight: isSelected ? 2.1 : 0.8,
                opacity: isSelected ? 0.95 : 0.7,
                fillColor,
                fillOpacity: isSelected ? 0.75 : 0.4
            };
        },
        onEachFeature: (feature, layerRef) => {
            const fips = String(feature.id || '');
            if (!selectedFips.has(fips)) {
                return;
            }

            const countyName = feature?.properties?.NAME || feature?.properties?.name || fips;
            const value = valuesByFips.get(fips);
            const valueText = formatTxMetricValue(metricKey, value);
            layerRef.bindTooltip(`${countyName}: ${valueText}`, {
                sticky: true,
                direction: 'top',
                className: 'tx-map-tooltip'
            });
        }
    }).addTo(map);

    const selectionBounds = L.geoJSON({ type: 'FeatureCollection', features: selectedFeatures }).getBounds();
    if (selectionBounds.isValid()) {
        map.fitBounds(selectionBounds, {
            padding: [24, 24],
            maxZoom: selectedFeatures.length === 1 ? 8 : 9
        });
    }

    return layer;
}

function populateTexasComparisonControls() {
    const leftSelect = document.getElementById('compareLeftSelect');
    const rightSelect = document.getElementById('compareRightSelect');
    const yearSelect = document.getElementById('compareYearSelect');

    if (!leftSelect || !rightSelect || !yearSelect) {
        return;
    }

    const locations = getTxLocations();
    const msaOptions = locations
        .filter((location) => location.type === 'MSA')
        .map((location) => `<option value="${location.id}">${location.name}</option>`)
        .join('');
    const countyOptions = locations
        .filter((location) => location.type === 'County')
        .map((location) => `<option value="${location.id}">${location.name}</option>`)
        .join('');
    const optionsHtml = [
        `<optgroup label="Metro Areas">${msaOptions}</optgroup>`,
        `<optgroup label="Counties">${countyOptions}</optgroup>`
    ].join('');

    leftSelect.innerHTML = optionsHtml;
    rightSelect.innerHTML = optionsHtml;

    yearSelect.innerHTML = TX_COMPARE_YEARS
        .map((year) => `<option value="${year}">${year}</option>`)
        .join('');

    const hasLeft = locations.some((location) => location.id === txCompareState.leftId);
    const hasRight = locations.some((location) => location.id === txCompareState.rightId);
    if (!hasLeft && locations[0]) {
        txCompareState.leftId = locations[0].id;
    }
    if (!hasRight && locations[1]) {
        txCompareState.rightId = locations[1].id;
    }

    leftSelect.value = txCompareState.leftId;
    rightSelect.value = txCompareState.rightId;
    yearSelect.value = String(txCompareState.year);
}

function ensureDistinctTexasSelections(changedSide) {
    if (txCompareState.leftId !== txCompareState.rightId) {
        return;
    }

    const fallback = getTxLocations().find((location) => {
        return location.id !== txCompareState.leftId;
    });

    if (!fallback) {
        return;
    }

    if (changedSide === 'left') {
        txCompareState.rightId = fallback.id;
        const rightSelect = document.getElementById('compareRightSelect');
        if (rightSelect) rightSelect.value = txCompareState.rightId;
    } else {
        txCompareState.leftId = fallback.id;
        const leftSelect = document.getElementById('compareLeftSelect');
        if (leftSelect) leftSelect.value = txCompareState.leftId;
    }
}

function renderTexasComparison() {
    const section = document.getElementById('tx-compare');
    if (!section) return;

    const leftLocation = getTxLocationById(txCompareState.leftId);
    const rightLocation = getTxLocationById(txCompareState.rightId);
    const metricKey = txCompareState.metric;
    const metric = getTxMetricConfig(metricKey);

    if (!leftLocation || !rightLocation) {
        return;
    }

    const summaryEl = document.getElementById('txCompareSummary');
    const countyTitleEl = document.getElementById('txCompareCountyTitle');
    const trendTitleEl = document.getElementById('txCompareTrendTitle');
    const tableLabelEl = document.getElementById('txCompareTableMetricLabel');
    const mapTitleEl = document.getElementById('txCompareMapTitle');
    const leftMapLabelEl = document.getElementById('txCompareMapLeftLabel');
    const rightMapLabelEl = document.getElementById('txCompareMapRightLabel');

    if (!txCompareState.ready) {
        if (summaryEl) {
            summaryEl.textContent = txCompareState.loadError
                ? `Unable to load API data: ${txCompareState.loadError}`
                : 'Loading live Texas county data from API...';
        }
        return;
    }

    const leftCountyRecords = getTxLocationCountiesWithValues(leftLocation, metricKey, txCompareState.year);
    const rightCountyRecords = getTxLocationCountiesWithValues(rightLocation, metricKey, txCompareState.year);
    const countyCoverage = [...leftCountyRecords, ...rightCountyRecords];
    const availableCount = countyCoverage.filter((county) => Number.isFinite(county.value)).length;
    const coverageText = `Data coverage: ${availableCount}/${countyCoverage.length} counties with values.`;

    if (summaryEl) {
        summaryEl.textContent = `${leftLocation.name} vs ${rightLocation.name} | ${metric.label} (${txCompareState.year}). ${coverageText} ${getTxMetricNarrative(metricKey)}`;
    }
    if (countyTitleEl) {
        countyTitleEl.textContent = `${metric.label} by County (${txCompareState.year})`;
    }
    if (trendTitleEl) {
        trendTitleEl.textContent = `${metric.label} Trend (${TX_COMPARE_YEARS[0]}-${TX_COMPARE_YEARS[TX_COMPARE_YEARS.length - 1]})`;
    }
    if (tableLabelEl) {
        tableLabelEl.textContent = `${metric.label} (${txCompareState.year})`;
    }
    if (mapTitleEl) {
        mapTitleEl.textContent = `${leftLocation.name} and ${rightLocation.name} County Footprint`;
    }
    if (leftMapLabelEl) {
        leftMapLabelEl.textContent = leftLocation.name;
    }
    if (rightMapLabelEl) {
        rightMapLabelEl.textContent = rightLocation.name;
    }

    const leftCountyLabels = leftCountyRecords.map((county) => `${county.county} (${leftLocation.type})`);
    const rightCountyLabels = rightCountyRecords.map((county) => `${county.county} (${rightLocation.type})`);
    const labels = [...leftCountyLabels, ...rightCountyLabels];

    const leftValues = leftCountyRecords.map((county) => county.value);
    const rightValues = rightCountyRecords.map((county) => county.value);

    const countyValues = [...leftValues, ...rightValues];
    const countyColors = [
        ...leftValues.map(() => 'rgba(203, 96, 21, 0.8)'),
        ...rightValues.map(() => 'rgba(0, 47, 108, 0.8)')
    ];

    txCompareCountyChart = destroyChart(txCompareCountyChart);
    txCompareCountyChart = createChartSafely('txCompareCountyChart', {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: metric.label,
                    data: countyValues,
                    backgroundColor: countyColors,
                    borderColor: countyColors,
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 18
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: {
                        callback: (value) => formatTxMetricValue(metricKey, Number(value))
                    }
                },
                y: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: (context) => Number.isFinite(context.dataset.data[context.dataIndex]),
                    anchor: 'end',
                    align: 'end',
                    offset: 6,
                    clamp: true,
                    color: '#1f2937',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    borderColor: 'rgba(148, 163, 184, 0.7)',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: { top: 2, bottom: 2, left: 5, right: 5 },
                    font: { size: 11, weight: '700' },
                    formatter: (value) => formatTxGraphLabelValue(value)
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${metric.label}: ${formatTxMetricValue(metricKey, context.parsed.x)}`
                    }
                }
            }
        }
    });

    const leftTrend = TX_COMPARE_YEARS.map((year) => getTxLocationAverage(leftLocation, metricKey, year));
    const rightTrend = TX_COMPARE_YEARS.map((year) => getTxLocationAverage(rightLocation, metricKey, year));

    txCompareTrendChart = destroyChart(txCompareTrendChart);
    txCompareTrendChart = createChartSafely('txCompareTrendChart', {
        type: 'line',
        data: {
            labels: TX_COMPARE_YEARS,
            datasets: [
                {
                    label: leftLocation.name,
                    data: leftTrend,
                    borderColor: '#CB6015',
                    backgroundColor: 'rgba(203, 96, 21, 0.12)',
                    tension: 0.28,
                    borderWidth: 3,
                    pointRadius: 3,
                    fill: false
                },
                {
                    label: rightLocation.name,
                    data: rightTrend,
                    borderColor: '#002F6C',
                    backgroundColor: 'rgba(0, 47, 108, 0.12)',
                    tension: 0.28,
                    borderWidth: 3,
                    pointRadius: 3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                datalabels: {
                    display: (context) => Number.isFinite(context.dataset.data[context.dataIndex]),
                    anchor: 'end',
                    align: (context) => (context.datasetIndex === 0 ? 'top' : 'bottom'),
                    offset: 6,
                    clamp: true,
                    color: '#0f172a',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(203, 213, 225, 0.9)',
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: { top: 2, bottom: 2, left: 5, right: 5 },
                    font: { size: 10, weight: '700' },
                    formatter: (value) => formatTxGraphLabelValue(value)
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatTxMetricValue(metricKey, context.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => formatTxMetricValue(metricKey, Number(value))
                    }
                }
            }
        }
    });

    const tableBody = document.getElementById('txCompareTableBody');
    if (tableBody) {
        const tableRows = [
            ...leftCountyRecords.map((county) => ({
                location: leftLocation.name,
                county: county.county,
                value: county.value
            })),
            ...rightCountyRecords.map((county) => ({
                location: rightLocation.name,
                county: county.county,
                value: county.value
            }))
        ];

        tableBody.innerHTML = tableRows.map((row) => {
            return `<tr><td>${row.location}</td><td>${row.county}</td><td>${formatTxMetricValue(metricKey, row.value)}</td></tr>`;
        }).join('');
    }

    if (txCompareStore.countiesGeoJson) {
        txCompareLayerLeft = renderTexasMap(txCompareMapLeft, txCompareLayerLeft, leftLocation, '#CB6015', metricKey, txCompareState.year);
        txCompareLayerRight = renderTexasMap(txCompareMapRight, txCompareLayerRight, rightLocation, '#002F6C', metricKey, txCompareState.year);

        setTimeout(() => {
            txCompareMapLeft?.invalidateSize();
            txCompareMapRight?.invalidateSize();
        }, 0);
    }
}

async function initTexasComparison() {
    const leftSelect = document.getElementById('compareLeftSelect');
    const rightSelect = document.getElementById('compareRightSelect');
    const yearSelect = document.getElementById('compareYearSelect');
    const categoryButtons = document.querySelectorAll('.tx-category-btn');

    if (!leftSelect || !rightSelect || !yearSelect) {
        return;
    }

    await Promise.all([
        loadTexasComparisonData(),
        loadTexasCountiesGeoJson()
    ]);

    buildTexasCountyLocationList();
    populateTexasComparisonControls();
    populateRegionalEmploymentControls();
    renderRegionalEmploymentComparison();

    leftSelect.addEventListener('change', (event) => {
        txCompareState.leftId = event.target.value;
        ensureDistinctTexasSelections('left');
        renderTexasComparison();
    });

    rightSelect.addEventListener('change', (event) => {
        txCompareState.rightId = event.target.value;
        ensureDistinctTexasSelections('right');
        renderTexasComparison();
    });

    yearSelect.addEventListener('change', (event) => {
        txCompareState.year = Number(event.target.value) || 2024;
        renderTexasComparison();
    });

    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => {
            categoryButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            txCompareState.metric = button.dataset.category || 'smoking';
            renderTexasComparison();
        });
    });

    initTexasComparisonMaps();
    renderTexasComparison();
}

function handleTexasCompareDownload() {
    const leftLocation = getTxLocationById(txCompareState.leftId);
    const rightLocation = getTxLocationById(txCompareState.rightId);
    const metricKey = txCompareState.metric;
    const metric = getTxMetricConfig(metricKey);

    if (!leftLocation || !rightLocation) {
        return;
    }

    let csv = `Location,County,Metric,Year,Value\n`;

    [leftLocation, rightLocation].forEach((location) => {
        const countyRows = getTxLocationCountiesWithValues(location, metricKey, txCompareState.year);
        countyRows.forEach((county) => {
            const selectedValue = county.value;
            csv += `"${location.name}","${county.county}","${metric.label}",${txCompareState.year},${Number.isFinite(selectedValue) ? selectedValue.toFixed(metric.decimals) : ''}\n`;
        });
    });

    csv += '\nLocation,Metric,Year,Average\n';
    [leftLocation, rightLocation].forEach((location) => {
        TX_COMPARE_YEARS.forEach((year) => {
            const average = getTxLocationAverage(location, metricKey, year);
            csv += `"${location.name}","${metric.label}",${year},${Number.isFinite(average) ? average.toFixed(metric.decimals) : ''}\n`;
        });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `texas_compare_${metricKey}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleTexasComparePngDownload() {
    const leftLocation = getTxLocationById(txCompareState.leftId);
    const rightLocation = getTxLocationById(txCompareState.rightId);
    const metric = getTxMetricConfig(txCompareState.metric);
    const chartSet = [txCompareCountyChart, txCompareTrendChart].filter(Boolean);

    if (!chartSet.length) {
        alert('Texas comparison chart is not ready yet.');
        return;
    }

    const titleParts = [
        leftLocation?.name,
        'vs',
        rightLocation?.name,
        `(${txCompareState.year})`
    ].filter(Boolean);

    downloadChartsAsCompositeImage(
        chartSet,
        `texas_compare_${txCompareState.metric}_${new Date().toISOString().split('T')[0]}.png`,
        {
            title: `${titleParts.join(' ')} - ${metric?.label || 'Texas Comparison'}`,
            chartLabels: ['County Breakdown', 'Trend Over Time']
        }
    );
}

function handleTexasMapGeoJsonDownload() {
    const leftLocation = getTxLocationById(txCompareState.leftId);
    const rightLocation = getTxLocationById(txCompareState.rightId);

    if (!leftLocation || !rightLocation || !txCompareStore.countiesGeoJson?.features) {
        alert('Texas map data is not ready yet.');
        return;
    }

    const leftFeatures = getTexasFeaturesForLocation(leftLocation);
    const rightFeatures = getTexasFeaturesForLocation(rightLocation);

    const featureCollection = {
        type: 'FeatureCollection',
        features: [...leftFeatures, ...rightFeatures]
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/geo+json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `texas_compare_counties_${new Date().toISOString().split('T')[0]}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleRegionalEmploymentDownload() {
    if (typeof REGIONAL_EMPLOYMENT_DATA === 'undefined') {
        alert('Regional employment data is not loaded yet.');
        return;
    }

    const leftLocation = getRegionalEmploymentLocationById(regionalEmploymentState.leftId);
    const rightLocation = getRegionalEmploymentLocationById(regionalEmploymentState.rightId);
    const year = regionalEmploymentState.year;

    if (!leftLocation || !rightLocation) {
        alert('Please select two valid locations first.');
        return;
    }

    const rows = ['Location,Type,Year,Section,Industry,Value,Unit'];
    const locations = [leftLocation, rightLocation];
    const industries = Array.isArray(REGIONAL_EMPLOYMENT_DATA.industries)
        ? REGIONAL_EMPLOYMENT_DATA.industries
        : [];

    locations.forEach((location) => {
        const record = getRegionalEmploymentRecord(location.id, year);
        if (!record) {
            return;
        }

        rows.push(`"${location.name}",${location.type},${year},Labor Market Rates,Unemployment Rate,${record.unemploymentRate},%`);
        rows.push(`"${location.name}",${location.type},${year},Labor Market Rates,Labor Force Participation Rate,${record.laborForceParticipationRate},%`);

        industries.forEach((industry) => {
            const wage = Number(record.weeklyWages?.[industry]);
            const employment = Number(record.industryEmployment?.[industry]);

            rows.push(`"${location.name}",${location.type},${year},Annual Average Weekly Wages,"${industry}",${Number.isFinite(wage) ? wage : ''},USD/week`);
            rows.push(`"${location.name}",${location.type},${year},Annual Average Employment,"${industry}",${Number.isFinite(employment) ? employment : ''},jobs`);
        });
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `regional_employment_${year}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function handleRegionalEmploymentPngDownload() {
    const charts = [regionalEmploymentRatesChart, regionalEmploymentWagesChart, regionalEmploymentIndustryChart].filter(Boolean);
    if (!charts.length) {
        alert('Regional employment charts are not ready yet.');
        return;
    }

    const leftLocation = getRegionalEmploymentLocationById(regionalEmploymentState.leftId);
    const rightLocation = getRegionalEmploymentLocationById(regionalEmploymentState.rightId);

    downloadChartsAsCompositeImage(
        charts,
        `regional_employment_${regionalEmploymentState.year}_${new Date().toISOString().split('T')[0]}.png`,
        {
            title: `${leftLocation?.name || 'Location A'} vs ${rightLocation?.name || 'Location B'} (${regionalEmploymentState.year})`,
            chartLabels: [
                'Labor Market Rates',
                'Annual Average Weekly Wages by Industry',
                'Annual Average Employment by Industry'
            ]
        }
    );
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
    document.getElementById('downloadTexasCompareBtn')?.addEventListener('click', handleTexasCompareDownload);
    document.getElementById('downloadTexasComparePngBtn')?.addEventListener('click', handleTexasComparePngDownload);
    document.getElementById('downloadTexasMapGeoJsonBtn')?.addEventListener('click', handleTexasMapGeoJsonDownload);
    document.getElementById('downloadRegionalEmploymentCsvBtn')?.addEventListener('click', handleRegionalEmploymentDownload);
    document.getElementById('downloadRegionalEmploymentPngBtn')?.addEventListener('click', handleRegionalEmploymentPngDownload);

    // PNG Download Event Listeners
    document.getElementById('downloadGDPPngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(gdpChart, `us_gdp_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadCPIPngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(cpiChart, `us_cpi_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadUnemploymentPngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(unemploymentChart, `unemployment_rates_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadPayemsPngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(payemsChart, `us_payroll_employment_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadEmploymentPngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(employmentChart, `employment_data_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadSalesTaxPngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(salesTaxChart, `tyler_sales_tax_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadMedianPricePngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(medianPriceChart, `tyler_median_home_price_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadMortgage30PngBtn')?.addEventListener('click', () => {
        downloadChartAsImage(mortgage30Chart, `us_mortgage_30yr_${new Date().toISOString().split('T')[0]}.png`);
    });
    document.getElementById('downloadTaxPngBtn')?.addEventListener('click', () => {
        if (window.taxChart) {
            const chart = window.taxChart.getChart();
            downloadChartAsImage(chart, `texas_tax_revenue_${new Date().toISOString().split('T')[0]}.png`);
        }
    });
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
        { id: 'shareTaxBtn', chart: () => (window.taxChart ? window.taxChart.getChart() : null), name: 'Texas Tax Revenue' },
        { id: 'shareTexasCompareBtn', chart: () => txCompareCountyChart, name: 'Texas County Comparison' }
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

// =============================================
// Educational Attainment Charts
// =============================================

let eduLeftChart = null;
let eduRightChart = null;

const EDU_COLORS = {
    bachelors:    '#002F6C',
    highSchool:   '#4A9EE8',
    noHighSchool: '#193C5A',
    someCollege:  '#5C8F66',
};

const EDU_LABELS = {
    bachelors:    "Bachelor's degree or higher",
    highSchool:   'High School Diploma',
    noHighSchool: 'No High School Diploma',
    someCollege:  "Some College or Associate's",
};

function initEducationCharts() {
    if (typeof EDUCATION_DATA === 'undefined') {
        console.warn('[Edu] EDUCATION_DATA not loaded');
        return;
    }

    const leftSel  = document.getElementById('eduLeftSelect');
    const rightSel = document.getElementById('eduRightSelect');
    const yearSel  = document.getElementById('eduYearSelect');

    if (!leftSel || !rightSel || !yearSel) return;

    // Populate location dropdowns
    EDUCATION_DATA.locations.forEach((loc, i) => {
        const optA = new Option(loc, loc);
        const optB = new Option(loc, loc);
        leftSel.appendChild(optA);
        rightSel.appendChild(optB);
        if (i === 0) optA.selected = true;
        if (i === 2) optB.selected = true; // default to DFW
    });

    // Populate year dropdown
    [...EDUCATION_DATA.years].reverse().forEach((yr, i) => {
        const opt = new Option(yr, yr);
        if (i === 0) opt.selected = true;
        yearSel.appendChild(opt);
    });

    // Don't render yet — charts must render inside a visible tab
    leftSel.addEventListener('change',  renderEducationCharts);
    rightSel.addEventListener('change', renderEducationCharts);
    yearSel.addEventListener('change',  renderEducationCharts);

    // CSV download
    document.getElementById('downloadEduCsvBtn')?.addEventListener('click', downloadEduCsv);

    // PNG download
    document.getElementById('downloadEduPngBtn')?.addEventListener('click', () => {
        const canvas = document.getElementById('eduLeftChart');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'educational-attainment.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function renderEducationCharts() {
    if (typeof EDUCATION_DATA === 'undefined') return;

    const leftLoc  = document.getElementById('eduLeftSelect')?.value;
    const rightLoc = document.getElementById('eduRightSelect')?.value;
    const year     = parseInt(document.getElementById('eduYearSelect')?.value, 10);

    if (!leftLoc || !rightLoc || !year) return;

    document.getElementById('eduLeftTitle').textContent  = leftLoc;
    document.getElementById('eduRightTitle').textContent = rightLoc;

    try {
        eduLeftChart  = buildEduChart('eduLeftChart',  leftLoc,  year, eduLeftChart);
        eduRightChart = buildEduChart('eduRightChart', rightLoc, year, eduRightChart);
    } catch (error) {
        console.error('[Edu] Failed to render educational attainment charts:', error);
    }
}

function buildEduChart(canvasId, location, year, existingChart) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return existingChart;

    const locData = EDUCATION_DATA.data[location]?.[year];
    if (!locData) {
        console.warn('[Edu] No data for', location, year);
        return existingChart;
    }

    const races = ['White', 'Hispanic', 'Black'];

    // Build datasets — stacked downward from 0% (reverse scale)
    const keys = ['bachelors', 'highSchool', 'noHighSchool', 'someCollege'];
    const datasets = keys.map(key => ({
        label: EDU_LABELS[key],
        data:  races.map(race => locData[race]?.[key] ?? 0),
        backgroundColor: EDU_COLORS[key],
        borderColor: 'rgba(255,255,255,0.35)',
        borderWidth: 1,
        borderRadius: 0,
    }));

    if (existingChart) existingChart.destroy();

    return new Chart(canvas, {
        type: 'bar',
        data: { labels: races, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`,
                    },
                },
                datalabels: {
                    display: (ctx) => {
                        const value = Number(ctx.dataset?.data?.[ctx.dataIndex]);
                        return Number.isFinite(value) && value >= 5;
                    },
                    formatter: val => val.toFixed(2) + '%',
                    color: '#fff',
                    font: { size: 11, weight: '600' },
                    anchor: 'center',
                    align: 'center',
                },
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { font: { size: 12, weight: '600' } },
                    title: { display: true, text: 'Race', font: { size: 12, weight: '700' } },
                },
                y: {
                    stacked: true,
                    reverse: true,
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: val => val + '%',
                        font: { size: 11 },
                    },
                    grid: { color: 'rgba(0,0,0,0.06)' },
                },
            },
        },
    });
}

function downloadEduCsv() {
    if (typeof EDUCATION_DATA === 'undefined') return;

    const year = parseInt(document.getElementById('eduYearSelect')?.value, 10);
    const rows = ['Location,Year,Race,Metric,Value'];

    EDUCATION_DATA.locations.forEach(loc => {
        const yearData = EDUCATION_DATA.data[loc]?.[year];
        if (!yearData) return;
        ['White', 'Hispanic', 'Black'].forEach(race => {
            const d = yearData[race];
            if (!d) return;
            Object.entries(d).forEach(([key, val]) => {
                rows.push(`"${loc}",${year},${race},${EDU_LABELS[key]},${val}`);
            });
        });
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `educational-attainment-${year}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
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

                if (tabId === 'tx-compare') {
                    renderTexasComparison();
                } else if (tabId === 'regional-employment') {
                    requestAnimationFrame(() => {
                        renderRegionalEmploymentComparison();
                        if (regionalEmploymentRatesChart) regionalEmploymentRatesChart.resize();
                        if (regionalEmploymentWagesChart) regionalEmploymentWagesChart.resize();
                        if (regionalEmploymentIndustryChart) regionalEmploymentIndustryChart.resize();
                    });
                } else if (tabId === 'regional-demographics') {
                    requestAnimationFrame(() => {
                        renderRegionalDemographics();
                        if (regionalDemoAgeChart) regionalDemoAgeChart.resize();
                        if (regionalDemoCommunityChart) regionalDemoCommunityChart.resize();
                        if (regionalDemoRaceChart) regionalDemoRaceChart.resize();
                    });
                } else if (tabId === 'edu-attainment') {
                    // Wait until the tab is visible and laid out before chart render.
                    requestAnimationFrame(() => {
                        renderEducationCharts();
                        if (eduLeftChart) eduLeftChart.resize();
                        if (eduRightChart) eduRightChart.resize();
                    });
                }
                
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
    initRegionalEmploymentComparison();
    initRegionalDemographics();
    initEducationCharts();
    initTexasComparison().catch((error) => {
        console.error('Texas comparison initialization failed:', error);
    });
    
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







