const GDP_ID = 'A191RL1Q225SBEA';
const CPI_ID = 'CPIAUCSL';
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
    ]
};

let gdpChart = null;
let cpiChart = null;
let employmentChart = null;
let salesTaxChart = null;
let mortgage30Chart = null;
let mortgage15Chart = null;
let revenueChart = null;
let cachedData = null;
let salesTaxData = [];
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
    if (end && !end.value) end.value = '2025';
}

function registerPlugins() {
    if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }
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

async function fetchSeries(seriesId) {
    // Try Netlify function first
    try {
        const url = `${FRED_FUNCTION}?seriesId=${seriesId}`;
        const res = await withTimeout(signal => fetch(url, { signal }), 9000);
        if (res.ok) {
            const data = await res.json();
            return data.observations || [];
        }
        throw new Error(`Function returned ${res.status}`);
    } catch (err) {
        console.warn(`[${seriesId}] Netlify function failed: ${err.message}`);
    }

    // Fallback proxies
    const url = `${FRED_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=10000`;
    const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://cors.isomorphic-git.org/',
        'https://thingproxy.freeboard.io/fetch/'
    ];

    for (let i = 0; i < proxies.length; i++) {
        const proxyUrl = proxies[i] + encodeURIComponent(url);
        try {
            const res = await withTimeout(signal => fetch(proxyUrl, { signal }), 9000);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.observations && data.observations.length) {
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
        const [gdpRaw, cpiRaw] = await Promise.all([
            fetchSeries(GDP_ID),
            fetchSeries(CPI_ID)
        ]);

        // Sort GDP data by date and parse
        const gdp = (gdpRaw || [])
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

        cachedData = { gdp, cpi };
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
        
        setStatus(`US economic data loaded successfully. GDP: ${gdp.length} quarters, CPI: ${cpi.length} months`, 'success');
    } catch (error) {
        console.warn('Falling back to sample data:', error.message);
        cachedData = { ...SAMPLE_DATA };
        dataSource = 'sample';
        setStatus('Displaying sample data (live API temporarily unavailable).', 'warn');
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
    return { gdp, cpi };
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

    // Employment Chart
    renderEmploymentChart();
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
        
        // Populate month dropdown (in fiscal year order: Sep-Aug)
        const monthOrder = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
        const monthSelect = document.getElementById('revenueMonth');
        if (monthSelect) {
            monthSelect.innerHTML = monthOrder.map((m, i) => 
                `<option value="${m}" ${m === 'September' ? 'selected' : ''}>${m}</option>`
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
        titleEl.textContent = `Texas Tax Collections - ${selectedMonth} ${selectedYear} (Total: $${(total / 1000000).toFixed(1)}M)`;
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
    document.getElementById('downloadEmploymentBtn')?.addEventListener('click', handleEmploymentDownload);
    document.getElementById('downloadSalesTaxBtn')?.addEventListener('click', handleSalesTaxDownload);
    document.getElementById('downloadMortgageBtn')?.addEventListener('click', handleMortgageDownload);
    document.getElementById('updateRevenueBtn')?.addEventListener('click', renderRevenueChart);
    document.getElementById('downloadRevenueBtn')?.addEventListener('click', handleRevenueDownload);
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
    loadData();
    loadRevenueData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}







