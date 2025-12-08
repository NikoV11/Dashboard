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
let cachedData = null;
let salesTaxData = [];
let mortgageData = [];
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

function renderTable(filtered) {
    const body = document.getElementById('tableBody');
    if (!body) return;
    body.innerHTML = '';

    const cpiMap = new Map(filtered.cpi.map(d => [d.date, d.value]));
    filtered.gdp.forEach(row => {
        const tr = document.createElement('tr');
        const cpi = cpiMap.has(row.date) ? `${cpiMap.get(row.date).toFixed(2)}%` : '—';
        tr.innerHTML = `
            <td>${formatDateDisplay(row.date)}</td>
            <td style="color:#CB6015;font-weight:600;">${row.value.toFixed(2)}%</td>
            <td style="color:#002F6C;font-weight:600;">${cpi}</td>
        `;
        body.appendChild(tr);
    });
}

async function renderAll() {
    if (!cachedData) return;
    const filtered = filterData();
    renderCharts(filtered);
    renderTable(filtered);
    
    // Load and render sales tax data
    await loadSalesTaxData();
    renderSalesTaxChart();
    
    // Load and render mortgage rates
    loadMortgageData();
    renderMortgageCharts();
    
    const note = document.querySelector('.source-note');
    if (note) {
        note.textContent = dataSource === 'live'
            ? 'US Data: Federal Reserve Economic Data (FRED) | Regional Data: Texas Comptroller & Employment Statistics'
            : 'US Data: Sample fallback | Regional Data: Texas Comptroller & Employment Statistics';
    }
}

function handleDownload() {
    if (!cachedData) return;
    const filtered = filterData();
    const cpiMap = new Map(filtered.cpi.map(d => [d.date, d.value]));
    
    // Get employment data
    const empData = parseEmploymentData();
    const startYear = parseInt(document.getElementById('startYear')?.value || 2015);
    const endYear = parseInt(document.getElementById('endYear')?.value || 2025);
    
    const tylerMap = new Map(
        empData.tyler
            .filter(d => {
                const year = new Date(d.date).getFullYear();
                return year >= startYear && year <= endYear;
            })
            .map(d => [d.date, d.value])
    );
    
    const texasMap = new Map(
        empData.texas
            .filter(d => {
                const year = new Date(d.date).getFullYear();
                return year >= startYear && year <= endYear;
            })
            .map(d => [d.date, d.value])
    );
    
    let csv = 'Date,GDP (% QoQ),CPI-U (% MoM),Tyler Employment (%),Texas Employment (%)\n';
    
    // Create set of all unique dates
    const allDates = new Set([
        ...filtered.gdp.map(d => d.date),
        ...filtered.cpi.map(d => d.date),
        ...empData.tyler.map(d => d.date),
        ...empData.texas.map(d => d.date)
    ]);
    
    // Sort dates
    const sortedDates = Array.from(allDates).sort();
    
    sortedDates.forEach(date => {
        const gdpData = filtered.gdp.find(d => d.date === date);
        const cpi = cpiMap.get(date);
        const tyler = tylerMap.get(date);
        const texas = texasMap.get(date);
        
        csv += `${formatDateDisplay(date)},`;
        csv += `${gdpData ? gdpData.value.toFixed(3) : ''},`;
        csv += `${cpi !== undefined ? cpi.toFixed(3) : ''},`;
        csv += `${tyler !== undefined ? tyler.toFixed(1) : ''},`;
        csv += `${texas !== undefined ? texas.toFixed(1) : ''}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `economic_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
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
    document.getElementById('downloadBtn')?.addEventListener('click', handleDownload);
    document.getElementById('downloadBtnTable')?.addEventListener('click', handleDownload);
    document.getElementById('downloadEmploymentBtn')?.addEventListener('click', handleEmploymentDownload);
    document.getElementById('downloadSalesTaxBtn')?.addEventListener('click', handleSalesTaxDownload);
    document.getElementById('downloadMortgageBtn')?.addEventListener('click', handleMortgageDownload);
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Setting up tabs. Found', tabBtns.length, 'buttons and', tabContents.length, 'content areas');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = btn.dataset.tab;
            console.log('Tab clicked:', tabId);
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}







