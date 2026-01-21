const GDP_ID = 'A191RL1Q225SBEA';
const CPI_ID = 'CPIAUCSL';
const UNEMPLOYMENT_ID = 'UNRATE';
const MEDIAN_PRICE_ID = 'MEDLISPRIMM46340';
const FRED_FUNCTION = '/.netlify/functions/fred-proxy';
const FRED_API_KEY = '313359708686770c608dab3d05c3077f';
const FRED_URL = 'https://api.stlouisfed.org/fred/series/observations';

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
let employmentChart = null;
let salesTaxChart = null;
let medianPriceChart = null;
let mortgage30Chart = null;
let mortgage15Chart = null;
let revenueChart = null;
let cachedData = null;
let salesTaxData = [];
let medianPriceData = [];
let mortgageData = [];
let revenueData = [];
let dataSource = 'sample';

function setStatus(text, tone = 'muted') {
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.className = `status ${tone}`;
    }
}

function ensureDefaults() {
    const start = document.getElementById('startYear');
    const end = document.getElementById('endYear');
    if (start && !start.value) start.value = '2023';
    if (end && !end.value) end.value = '2026';
}

function registerPlugins() {
    if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }
}

// Data cache for resilience
const dataCache = {};
const CACHE_DURATION = 3600000; // 1 hour

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

async function fetchWithRetry(url, maxRetries = 3, timeout = 12000) {
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

async function fetchSeries(seriesId) {
    // Check cache first
    if (dataCache[seriesId] && Date.now() - dataCache[seriesId].timestamp < CACHE_DURATION) {
        console.log(`[${seriesId}] Using cached data`);
        return dataCache[seriesId].data;
    }

    // Try Netlify function first (most reliable)
    try {
        const url = `${FRED_FUNCTION}?seriesId=${seriesId}`;
        console.log(`[${seriesId}] Trying Netlify function...`);
        const res = await fetchWithRetry(url, 2, 12000);
        const data = await res.json();
        const observations = data.observations || [];
        if (observations.length > 0) {
            dataCache[seriesId] = { data: observations, timestamp: Date.now() };
            console.log(`[${seriesId}] Successfully fetched ${observations.length} records from Netlify`);
            return observations;
        }
        throw new Error('No observations returned');
    } catch (err) {
        console.warn(`[${seriesId}] Netlify function failed: ${err.message}`);
    }

    // Fallback to CORS proxies
    const url = `${FRED_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=10000`;
    const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://thingproxy.freeboard.io/fetch/',
        'https://cors.isomorphic-git.org/'
    ];

    for (let i = 0; i < proxies.length; i++) {
        const proxyUrl = proxies[i] + encodeURIComponent(url);
        try {
            console.log(`[${seriesId}] Trying proxy ${i + 1}/${proxies.length}...`);
            const res = await fetchWithRetry(proxyUrl, 2, 12000);
            const data = await res.json();
            if (data.observations && data.observations.length) {
                dataCache[seriesId] = { data: data.observations, timestamp: Date.now() };
                console.log(`[${seriesId}] Successfully fetched ${data.observations.length} records from proxy ${i + 1}`);
                return data.observations;
            }
            throw new Error('No observations');
        } catch (err) {
            console.warn(`[${seriesId}] Proxy ${i + 1} failed: ${err.message}`);
        }
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
            fetchSeries(UNEMPLOYMENT_ID)
        ]);

        // Handle settled promises - use fallback if any fail
        let gdpRaw = [];
        let cpiRaw = [];
        let unemploymentRaw = [];

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
            console.warn('Unemployment fetch failed, will use sample data');
        }

        // If all three failed, use sample data
        if (!gdpRaw.length && !cpiRaw.length && !unemploymentRaw.length) {
            throw new Error('All series failed to fetch');
        }

        // Sort GDP data by date and parse
        const gdp = (gdpRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Parse unemployment data
        const unemployment = (unemploymentRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => !Number.isNaN(d.value))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

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

        cachedData = { gdp, cpi, unemployment };
        dataSource = 'live';
        
        // Log the data information
        console.log(`GDP data points: ${gdp.length}`);
        if (gdp.length > 0) {
            console.log('First GDP:', gdp[0]);
            console.log('Latest GDP:', gdp[gdp.length - 1]);
        }
        
        console.log(`CPI data points: ${cpi.length}`);
        if (cpi.length > 0) {
            console.log('First CPI:', cpi[0]);
            console.log('Latest CPI:', cpi[cpi.length - 1]);
        }
        
        console.log(`Unemployment data points: ${unemployment.length}`);
        if (unemployment.length > 0) {
            console.log('First Unemployment:', unemployment[0]);
            console.log('Latest Unemployment:', unemployment[unemployment.length - 1]);
        }
        
        setStatus(`US economic data loaded successfully. GDP: ${gdp.length} quarters, CPI: ${cpi.length} months, Unemployment: ${unemployment.length} months`, 'success');
    } catch (error) {
        console.error('All data fetch attempts failed, falling back to sample data:', error.message);
        cachedData = { ...SAMPLE_DATA };
        dataSource = 'sample';
        setStatus('Using sample data. Live API temporarily unavailable - retrying in 30s', 'warn');
        
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
    const startYear = parseInt(document.getElementById('startYear')?.value || 2023);
    const endYear = parseInt(document.getElementById('endYear')?.value || 2025);
    
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
        
        // Group by year and month, summing net payments
        const grouped = new Map();
        
        allData.forEach(d => {
            const year = parseInt(d.report_year);
            const month = parseInt(d.report_month);
            
            // Filter by year range
            if (year < startYear || year > endYear) return;
            
            const key = `${year}-${String(month).padStart(2, '0')}`;
            const value = parseFloat(d.net_payment_this_period) || 0;
            
            if (grouped.has(key)) {
                grouped.get(key).value += value;
                grouped.get(key).count += 1;
            } else {
                grouped.set(key, {
                    year,
                    month,
                    value,
                    count: 1,
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
                    const prevValue = arr[idx - 1].value;
                    if (prevValue !== 0) {
                        periodChange = ((item.value - prevValue) / prevValue) * 100;
                    }
                }
                
                // Calculate year-over-year change
                let yoyChange = 0;
                const prevYearIdx = arr.findIndex(d => d.year === item.year - 1 && d.month === item.month);
                if (prevYearIdx !== -1) {
                    const prevYearValue = arr[prevYearIdx].value;
                    if (prevYearValue !== 0) {
                        yoyChange = ((item.value - prevYearValue) / prevYearValue) * 100;
                    }
                }
                
                return {
                    date: item.date,
                    value: item.value,
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
        const startYear = parseInt(document.getElementById('startYear')?.value || 2023);
        const endYear = parseInt(document.getElementById('endYear')?.value || 2025);
        
        const medianPriceRaw = await fetchSeries(MEDIAN_PRICE_ID);
        
        medianPriceData = (medianPriceRaw || [])
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .filter(d => {
                if (Number.isNaN(d.value)) return false;
                const year = new Date(d.date).getFullYear();
                return year >= startYear && year <= endYear;
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
    const start = parseInt(document.getElementById('startYear').value, 10) || 2023;
    const end = parseInt(document.getElementById('endYear').value, 10) || 2025;
    const gdp = cachedData.gdp.filter(d => {
        const y = new Date(d.date).getFullYear();
        return y >= start && y <= end;
    });
    const cpi = cachedData.cpi.filter(d => {
        const y = new Date(d.date).getFullYear();
        return y >= start && y <= end;
    });
    const unemployment = cachedData.unemployment.filter(d => {
        const y = new Date(d.date).getFullYear();
        return y >= start && y <= end;
    });
    return { gdp, cpi, unemployment };
}

function renderCharts(filtered) {
    const gdpCtx = document.getElementById('gdpChart')?.getContext('2d');
    const cpiCtx = document.getElementById('cpiChart')?.getContext('2d');
    if (!gdpCtx || !cpiCtx) return;

    const sharedOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 400
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.parsed.y.toFixed(2)}%`
                }
            },
            datalabels: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: v => `${v}%` }
            }
        }
    };

    if (gdpChart) gdpChart.destroy();
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
        options: sharedOptions
    });

    if (cpiChart) cpiChart.destroy();
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
        options: sharedOptions
    });

    // Unemployment Chart
    renderUnemploymentChart(filtered);
    
    // Employment Chart
    renderEmploymentChart();
}

function renderUnemploymentChart(filtered) {
    const canvas = document.getElementById('unemploymentChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (unemploymentChart) unemploymentChart.destroy();
    
    unemploymentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filtered.unemployment.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: 'Unemployment Rate',
                data: filtered.unemployment.map(d => d.value),
                borderColor: '#CB6015',
                backgroundColor: 'rgba(203, 96, 21, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15,
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    }
                },
                y: {
                    beginAtZero: true,
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

function renderEmploymentChart() {
    const canvas = document.getElementById('employmentChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const empData = parseEmploymentData();
    
    // Filter by year range
    const startYear = parseInt(document.getElementById('startYear')?.value || 2023);
    const endYear = parseInt(document.getElementById('endYear')?.value || 2025);
    
    const filteredTyler = empData.tyler.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });
    
    const filteredTexas = empData.texas.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });

    if (employmentChart) employmentChart.destroy();
    
    employmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filteredTyler.map(d => formatMonthLabel(d.date)),
            datasets: [
                {
                    label: 'Tyler',
                    data: filteredTyler.map(d => d.value),
                    backgroundColor: '#CB6015',
                    borderRadius: 6
                },
                {
                    label: 'Texas',
                    data: filteredTexas.map(d => d.value),
                    backgroundColor: '#002F6C',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
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
                datalabels: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 20,
                        font: { size: 12, weight: '500' },
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

function renderSalesTaxChart() {
    const canvas = document.getElementById('salesTaxChart');
    if (!canvas || !salesTaxData || salesTaxData.length === 0) return;
    
    const ctx = canvas.getContext('2d');

    if (salesTaxChart) salesTaxChart.destroy();
    
    salesTaxChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesTaxData.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: 'Net Collections',
                data: salesTaxData.map(d => d.value),
                backgroundColor: '#CB6015',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: (items) => {
                            const idx = items[0].dataIndex;
                            const data = salesTaxData[idx];
                            return formatMonthLabel(data.date);
                        },
                        label: (context) => {
                            const value = context.parsed.y;
                            return `Net Payment: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                        },
                        afterLabel: (context) => {
                            const idx = context.dataIndex;
                            const data = salesTaxData[idx];
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
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 20,
                        font: { size: 12, weight: '500' },
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

function renderMedianPriceChart() {
    const canvas = document.getElementById('medianPriceChart');
    if (!canvas || !medianPriceData || medianPriceData.length === 0) return;
    
    const ctx = canvas.getContext('2d');

    if (medianPriceChart) medianPriceChart.destroy();
    
    medianPriceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: medianPriceData.map(d => formatMonthLabel(d.date)),
            datasets: [{
                label: 'Median Listing Price',
                data: medianPriceData.map(d => d.value),
                borderColor: '#002F6C',
                backgroundColor: 'rgba(0, 47, 108, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(2)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15,
                        font: { size: 12, weight: '500' },
                        color: '#475569'
                    }
                },
                y: {
                    beginAtZero: true,
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

function loadMortgageData() {
    try {
        const startYear = parseInt(document.getElementById('startYear')?.value || 2023);
        const endYear = parseInt(document.getElementById('endYear')?.value || 2025);
        
        mortgageData = MORTGAGE_RATES_DATA
            .filter(d => {
                const year = new Date(d.date).getFullYear();
                return year >= startYear && year <= endYear;
            });
        
        console.log(`Mortgage rates data points: ${mortgageData.length}`);
        if (mortgageData.length > 0) {
            console.log('First Mortgage Rate:', mortgageData[0]);
            console.log('Latest Mortgage Rate:', mortgageData[mortgageData.length - 1]);
        }
        
        return mortgageData;
    } catch (error) {
        console.error('Mortgage data load failed:', error);
        mortgageData = [];
        return [];
    }
}

function renderMortgageCharts() {
    const canvas30 = document.getElementById('mortgage30Chart');
    const canvas15 = document.getElementById('mortgage15Chart');
    
    if (!canvas30 || !canvas15 || !mortgageData || mortgageData.length === 0) return;
    
    const ctx30 = canvas30.getContext('2d');
    const ctx15 = canvas15.getContext('2d');
    
    // Filter data for each chart
    const data30 = mortgageData.filter(d => d.rate30yr !== null);
    const data15 = mortgageData.filter(d => d.rate15yr !== null);
    
    // 30-Year Chart
    if (mortgage30Chart) mortgage30Chart.destroy();
    
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
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(2)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15,
                        font: { size: 12, weight: '500' },
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
    if (mortgage15Chart) mortgage15Chart.destroy();
    
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
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(2)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15,
                        font: { size: 12, weight: '500' },
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

function loadRevenueData() {
    try {
        if (typeof REVENUE_DATA === 'undefined') {
            console.error('REVENUE_DATA not loaded');
            return;
        }
        
        revenueData = REVENUE_DATA;
        console.log(`Revenue data loaded: ${revenueData.length} records`);
        
        // Populate year dropdown
        const years = [...new Set(revenueData.map(d => d.year))].sort((a, b) => b - a);
        const yearSelect = document.getElementById('revenueYear');
        if (yearSelect) {
            yearSelect.innerHTML = years.map(y => 
                `<option value="${y}" ${y === 2024 ? 'selected' : ''}>${y}</option>`
            ).join('');
        }
        
        // Populate month dropdown (calendar year order: Jan-Dec)
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthSelect = document.getElementById('revenueMonth');
        if (monthSelect) {
            monthSelect.innerHTML = monthOrder.map((m, i) => 
                `<option value="${m}" ${m === 'January' ? 'selected' : ''}>${m}</option>`
            ).join('');
        }
        
        renderRevenueChart();
    } catch (error) {
        console.error('Revenue data load failed:', error);
    }
}

function renderRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || !revenueData || revenueData.length === 0) return;
    
    const yearSelect = document.getElementById('revenueYear');
    const monthSelect = document.getElementById('revenueMonth');
    
    if (!yearSelect || !monthSelect) return;
    
    const selectedYear = parseInt(yearSelect.value);
    const selectedMonth = monthSelect.value;
    
    // Filter data for selected year and month - only tax categories
    const filteredData = revenueData.filter(d => 
        d.year === selectedYear && 
        d.month === selectedMonth &&
        (d.category.includes('Tax') || d.category.includes('Taxes')) &&
        !['Tax Collections', 'Total Tax Collections', 'Total Net Revenue'].includes(d.category)
    );
    
    if (filteredData.length === 0) {
        console.log('No data for selected month/year');
        return;
    }
    
    // Group by category and sum values
    const categoryTotals = {};
    filteredData.forEach(d => {
        // Normalize category names
        let category = d.category;
        if (category.includes('Motor Fuel')) category = 'Motor Fuels Taxes';
        if (category.includes('Alcoholic Beverage')) category = 'Alcoholic Beverage Taxes';
        if (category.includes('Natural Gas')) category = 'Natural Gas Production Tax';
        
        if (categoryTotals[category]) {
            categoryTotals[category] += d.value;
        } else {
            categoryTotals[category] = d.value;
        }
    });
    
    // Calculate total for percentage calculation
    const grandTotal = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    // Sort by value descending
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    // Group categories under 1% into "Others"
    const finalCategories = [];
    let othersTotal = 0;
    
    sortedCategories.forEach(([cat, val]) => {
        const percentage = (val / grandTotal) * 100;
        if (percentage >= 1.0) {
            finalCategories.push([cat, val]);
        } else {
            othersTotal += val;
        }
    });
    
    // Add "Others" category if there are any small categories
    if (othersTotal > 0) {
        finalCategories.push(['Others', othersTotal]);
    }
    
    const labels = finalCategories.map(([cat, val]) => cat);
    const values = finalCategories.map(([cat, val]) => val);
    
    // Color palette
    const colors = [
        '#CB6015', '#002F6C', '#E07A3C', '#1A4D8F', '#F4A460',
        '#4169E1', '#FF8C42', '#6495ED', '#D2691E', '#5B9BD5',
        '#C65D21', '#003A70', '#F2994A', '#2E5C99', '#FFB366'
    ];
    
    const ctx = canvas.getContext('2d');
    
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: '500' },
                        color: '#0f172a',
                        generateLabels: (chart) => {
                            const data = chart.data;
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label}: $${(value / 1000).toFixed(0)}K (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                    }
                },
                datalabels: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Update chart title
    const titleEl = document.getElementById('revenueChartTitle');
    if (titleEl) {
        const total = values.reduce((a, b) => a + b, 0);
        titleEl.textContent = `Texas Tax Collections - ${selectedMonth} FY${selectedYear} (Total: $${(total / 1000000).toFixed(1)}M)`;
    }
}

function handleRevenueDownload() {
    const yearSelect = document.getElementById('revenueYear');
    const monthSelect = document.getElementById('revenueMonth');
    
    if (!yearSelect || !monthSelect || !revenueData || revenueData.length === 0) {
        alert('No revenue data available to download.');
        return;
    }
    
    const selectedYear = parseInt(yearSelect.value);
    const selectedMonth = monthSelect.value;
    
    const filteredData = revenueData.filter(d => 
        d.year === selectedYear && d.month === selectedMonth
    );
    
    let csv = 'Category,Value ($)\n';
    
    filteredData.forEach(item => {
        csv += `${item.category},${item.value.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `texas_revenue_${selectedMonth}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function renderAll() {
    if (!cachedData) return;
    const filtered = filterData();
    renderCharts(filtered);
    
    // Load and render sales tax data
    await loadSalesTaxData();
    renderSalesTaxChart();
    
    // Load and render median home price data
    await loadMedianPriceData();
    renderMedianPriceChart();
    
    // Load and render mortgage rates
    loadMortgageData();
    renderMortgageCharts();
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
    
    let csv = 'Date,Unemployment Rate (%)\n';
    filtered.unemployment.forEach(d => {
        csv += `${formatMonthLabel(d.date)},${d.value.toFixed(1)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `us_unemployment_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatQuarterLabel(dateStr) {
    const d = new Date(dateStr);
    const month = d.getUTCMonth(); // Use UTC to avoid timezone issues
    const year = d.getUTCFullYear();
    const q = Math.floor(month / 3) + 1;
    return `Q${q} ${year}`;
}

function formatMonthLabel(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDateDisplay(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function handleEmploymentDownload() {
    const empData = parseEmploymentData();
    const startYear = parseInt(document.getElementById('startYear')?.value || 2023);
    const endYear = parseInt(document.getElementById('endYear')?.value || 2025);
    
    const filteredTyler = empData.tyler.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });
    
    const filteredTexas = empData.texas.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
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
    
    let csv = 'Date,Net Payment ($),Period Change (%),Year-over-Year Change (%)\n';
    
    salesTaxData.forEach(item => {
        csv += `${formatMonthLabel(item.date)},`;
        csv += `${item.value.toFixed(2)},`;
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
    
    let csv = 'Date,Month-Over-Month Change (%)\n';
    
    medianPriceData.forEach(item => {
        csv += `${formatMonthLabel(item.date)},${item.value.toFixed(2)}\n`;
    });
    
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
    
    let csv = 'Date,30-Year Fixed Rate (%),15-Year Fixed Rate (%)\n';
    
    mortgageData.forEach(item => {
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

function wireEvents() {
    document.getElementById('updateBtn')?.addEventListener('click', renderAll);
    document.getElementById('downloadGDPBtn')?.addEventListener('click', handleGDPDownload);
    document.getElementById('downloadCPIBtn')?.addEventListener('click', handleCPIDownload);
    document.getElementById('downloadUnemploymentBtn')?.addEventListener('click', handleUnemploymentDownload);
    document.getElementById('downloadEmploymentBtn')?.addEventListener('click', handleEmploymentDownload);
    document.getElementById('downloadSalesTaxBtn')?.addEventListener('click', handleSalesTaxDownload);
    document.getElementById('downloadMedianPriceBtn')?.addEventListener('click', handleMedianPriceDownload);
    document.getElementById('downloadMortgageBtn')?.addEventListener('click', handleMortgageDownload);
    document.getElementById('updateRevenueBtn')?.addEventListener('click', renderRevenueChart);
    document.getElementById('downloadRevenueBtn')?.addEventListener('click', handleRevenueDownload);
}

// ========== Share Functionality ==========

function setupShareButtons() {
    const shareButtons = [
        { id: 'shareGDPBtn', chart: () => gdpChart, name: 'Real GDP Growth' },
        { id: 'shareCPIBtn', chart: () => cpiChart, name: 'CPI-U Inflation' },
        { id: 'shareUnemploymentBtn', chart: () => unemploymentChart, name: 'Unemployment Rate' },
        { id: 'shareEmploymentBtn', chart: () => employmentChart, name: 'Employment Trends' },
        { id: 'shareSalesTaxBtn', chart: () => salesTaxChart, name: 'Tyler MSA Sales Tax' },
        { id: 'shareMedianPriceBtn', chart: () => medianPriceChart, name: 'Tyler Median Home Price' },
        { id: 'shareMortgageBtn', chart: () => mortgage30Chart, name: 'Mortgage Rates' },
        { id: 'shareRevenueBtn', chart: () => revenueChart, name: 'Texas Tax Collections' }
    ];

    shareButtons.forEach(({ id, chart, name }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => shareChart(chart(), name));
        }
    });
}

function shareChart(chartInstance, chartName) {
    if (!chartInstance) {
        alert('Chart not yet loaded. Please wait for data to load.');
        return;
    }

    try {
        // Get chart as base64 image
        const imageUrl = chartInstance.toBase64Image('image/png', 1);
        
        // Create share URL
        const dashboardUrl = window.location.href.split('?')[0];
        const shareText = `${chartName} - Hibbs Monitor Dashboard`;
        
        // Check if Web Share API is available (mobile devices)
        if (navigator.share && navigator.canShare) {
            // Convert base64 to blob for sharing
            fetch(imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `${chartName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
                    
                    navigator.share({
                        title: shareText,
                        text: `Check out this chart from UT Tyler Hibbs Institute Economic Dashboard`,
                        url: dashboardUrl,
                        files: [file]
                    }).catch(err => {
                        if (err.name !== 'AbortError') {
                            console.error('Share failed:', err);
                            fallbackShare(imageUrl, shareText, dashboardUrl);
                        }
                    });
                })
                .catch(() => {
                    // If file sharing fails, try without file
                    navigator.share({
                        title: shareText,
                        text: `Check out this chart from UT Tyler Hibbs Institute Economic Dashboard`,
                        url: dashboardUrl
                    }).catch(() => fallbackShare(imageUrl, shareText, dashboardUrl));
                });
        } else {
            fallbackShare(imageUrl, shareText, dashboardUrl);
        }
    } catch (error) {
        console.error('Error sharing chart:', error);
        alert('Unable to share chart. Please try downloading the data instead.');
    }
}

function fallbackShare(imageUrl, shareText, dashboardUrl) {
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
                Download Image
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
    
    // Post to X (Twitter) - Opens composer with text and URL
    content.querySelector('#postTwitter').addEventListener('click', () => {
        const postText = `${shareText} 📊\n\nCheck out this economic data from UT Tyler Hibbs Institute`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}&url=${encodeURIComponent(dashboardUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=600');
    });
    
    // Post to LinkedIn - Opens share dialog
    content.querySelector('#postLinkedIn').addEventListener('click', () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dashboardUrl)}`;
        window.open(linkedInUrl, '_blank', 'width=550,height=600');
    });
    
    // Post to Facebook - Opens share dialog
    content.querySelector('#postFacebook').addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dashboardUrl)}&quote=${encodeURIComponent(shareText + ' - Economic data from UT Tyler Hibbs Institute')}`;
        window.open(facebookUrl, '_blank', 'width=550,height=600');
    });
    
    // Instagram - Download with instructions (Instagram doesn't support web posting)
    content.querySelector('#postInstagram').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${shareText.replace(/\s+/g, '_')}_Hibbs_Monitor.png`;
        a.click();
        
        // Show Instagram instructions
        const instructionDiv = content.querySelector('#postInstagram').parentElement;
        const existingInstructions = instructionDiv.querySelector('.instagram-instructions');
        if (!existingInstructions) {
            const instructions = document.createElement('p');
            instructions.className = 'instagram-instructions';
            instructions.style.cssText = 'margin-top: 8px; padding: 8px 12px; background: #f0f9ff; border-radius: 6px; font-size: 12px; color: #0c4a6e; text-align: center;';
            instructions.innerHTML = '✓ Image saved! Open Instagram app and upload from your gallery.';
            instructionDiv.appendChild(instructions);
            setTimeout(() => {
                if (instructions.parentElement) {
                    instructions.remove();
                }
            }, 5000);
        }
    });
    
    // Download image
    content.querySelector('#downloadImage').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${shareText.replace(/\s+/g, '_')}.png`;
        a.click();
        document.body.removeChild(modal);
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
            } else {
                console.error('Could not find tab content with id:', tabId);
            }
        });
    });
}

function init() {
    registerPlugins();
    ensureDefaults();
    wireEvents();
    setupTabs();
    setupShareButtons();
    loadData();
    loadRevenueData();
}



if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}







