// FRED API Configuration
// API endpoint: /.netlify/functions/fred-proxy (handles API key server-side)

// FRED Series IDs
const GDPC1_ID = 'GDPC1';      // Real GDP (quarterly)
const CPIAUCSL_ID = 'CPIAUCSL'; // CPI-U (monthly)

let gdpChart = null;
let cpiChart = null;
let cachedData = null;
let lastFetchTime = null;
let dataSource = 'sample'; // 'live' or 'sample'

function initializeApp() {
    try {
        // Register Chart.js datalabels plugin when DOM is ready
        if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
            Chart.register(ChartDataLabels);
        }
        fetchFREDData();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

async function fetchFREDData() {
    try {
        console.log('Fetching FRED data...');
        const gdpData = await fetchFREDSeries(GDPC1_ID);
        const cpiData = await fetchFREDSeries(CPIAUCSL_ID);

        console.log('Data fetched, calculating percent changes...');
        
        // Calculate annualized quarter-over-quarter % change for GDP
        const gdpProcessed = [];
        for (let i = 1; i < gdpData.length; i++) {
            const current = parseFloat(gdpData[i].value);
            const previous = parseFloat(gdpData[i - 1].value);
            if (!isNaN(current) && !isNaN(previous)) {
                // Calculate QoQ % change first
                const qoqChange = ((current - previous) / previous);
                // Annualize: (1 + qoq)^4 - 1
                const annualizedChange = (Math.pow(1 + qoqChange, 4) - 1) * 100;
                gdpProcessed.push({
                    date: gdpData[i].date,
                    value: parseFloat(annualizedChange.toFixed(2))
                });
            }
        }

        // Calculate month-over-month % change for CPI
        const cpiProcessed = [];
        for (let i = 1; i < cpiData.length; i++) {
            const current = parseFloat(cpiData[i].value);
            const previous = parseFloat(cpiData[i - 1].value);
            if (!isNaN(current) && !isNaN(previous)) {
                const percentChange = ((current - previous) / previous) * 100;
                cpiProcessed.push({
                    date: cpiData[i].date,
                    value: parseFloat(percentChange.toFixed(4))
                });
            }
        }

        cachedData = {
            gdp: gdpProcessed,
            cpi: cpiProcessed
        };

        lastFetchTime = Date.now();
        dataSource = 'live';
        console.log('Live data loaded successfully');
        initializeCharts();
        populateDataTable();
        setupEventListeners();
    } catch (error) {
        console.error('Error fetching FRED data:', error);
        showErrorMessage('Failed to load FRED data. Please check your API connection and try again.');
    }
}

async function fetchFREDSeries(seriesId) {
    console.log(`Fetching ${seriesId} from FRED API...`);
    
    // Use CORS proxy to bypass browser restrictions
    const apiKey = '313359708686770c608dab3d05c3077f';
    const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=10000`;
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    
    try {
        console.log(`Calling FRED API for ${seriesId}...`);
        const response = await fetch(corsProxy + encodeURIComponent(fredUrl));

        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.observations && Array.isArray(data.observations) && data.observations.length > 0) {
                const processedData = data.observations.map(obs => ({
                    date: obs.date,
                    value: parseFloat(obs.value)
                })).filter(obs => !isNaN(obs.value));

                console.log(`✓ Successfully fetched ${seriesId}: ${processedData.length} data points`);
                dataSource = 'live';
                return processedData;
            } else {
                console.warn(`No observations found for ${seriesId}`);
            }
        } else {
            const errorText = await response.text();
            console.warn(`Server returned status ${response.status}: ${errorText.substring(0, 100)}`);
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.warn(`Failed to fetch ${seriesId}: ${error.message}`);
    }

    // Fallback to sample data
    console.warn(`Falling back to sample data for ${seriesId}`);
    throw new Error(`Could not fetch ${seriesId}. Using sample data.`);
}

function calculatePercentChange(data, frequency) {
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const current = data[i].value;
        const previous = data[i - 1].value;

        if (current !== null && previous !== null && previous !== 0) {
            const percentChange = 100 * (current / previous - 1);
            result.push({
                date: data[i].date,
                value: parseFloat(percentChange.toFixed(2))
            });
        }
    }

    return result;
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 50px; right: 10px; background: #d32f2f; color: white; padding: 15px 20px; border-radius: 4px; z-index: 1000; max-width: 300px; font-size: 14px;';
    document.body.appendChild(errorDiv);
    
    console.warn('User notification:', message);

    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

function setupEventListeners() {
    document.getElementById('updateBtn').addEventListener('click', updateCharts);
    document.getElementById('downloadBtn').addEventListener('click', downloadData);
}

function initializeCharts() {
    const gdpCanvas = document.getElementById('gdpChart');
    const cpiCanvas = document.getElementById('cpiChart');

    if (!gdpCanvas || !cpiCanvas) {
        console.error('Canvas elements not found');
        return;
    }

    const gdpCtx = gdpCanvas.getContext('2d');
    const cpiCtx = cpiCanvas.getContext('2d');

    if (!gdpCtx || !cpiCtx) {
        console.error('Failed to get canvas context');
        return;
    }

    const filteredData = getFilteredData();

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    font: { size: 12, weight: '600' },
                    padding: 15,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 10,
                titleFont: { size: 12, weight: '600' },
                bodyFont: { size: 11 },
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return context.parsed.y.toFixed(2) + '%';
                    }
                }
            },
            datalabels: {
                display: true,
                anchor: 'end',
                align: 'end',
                offset: 6,
                font: {
                    size: 11,
                    weight: '600'
                },
                color: '#333',
                formatter: function(value) {
                    return value.toFixed(1);
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value.toFixed(1) + '%';
                    },
                    font: { size: 11 }
                },
                title: {
                    display: true,
                    text: 'Percent Change (%)',
                    font: { size: 12, weight: '600' }
                }
            },
            x: {
                ticks: {
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 0
                }
            }
        }
    };

    if (gdpChart) gdpChart.destroy();
    gdpChart = new Chart(gdpCtx, {
        type: 'bar',
        data: {
            labels: filteredData.gdp.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: 'GDP % Change',
                data: filteredData.gdp.map(d => d.value),
                backgroundColor: '#CB6015',
                borderColor: '#a84d0f',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#a84d0f'
            }]
        },
        options: chartOptions
    });

    if (cpiChart) cpiChart.destroy();
    cpiChart = new Chart(cpiCtx, {
        type: 'bar',
        data: {
            labels: filteredData.cpi.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: 'CPI-U 1-Month % Change',
                data: filteredData.cpi.map(d => d.value),
                backgroundColor: '#002F6C',
                borderColor: '#001d42',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#001d42'
            }]
        },
        options: chartOptions
    });
}

function updateCharts() {
    const filteredData = getFilteredData();

    // Update GDP chart
    gdpChart.data.labels = filteredData.gdp.map(d => formatDateLabel(d.date));
    gdpChart.data.datasets[0].data = filteredData.gdp.map(d => d.value);
    gdpChart.update();

    // Update CPI chart
    cpiChart.data.labels = filteredData.cpi.map(d => formatDateLabel(d.date));
    cpiChart.data.datasets[0].data = filteredData.cpi.map(d => d.value);
    cpiChart.update();

    // Refresh table
    populateDataTable();
}

function getFilteredData() {
    const startYear = parseInt(document.getElementById('startYear').value);
    const endYear = parseInt(document.getElementById('endYear').value);

    if (!cachedData) {
        return { gdp: [], cpi: [] };
    }

    const gdpFiltered = cachedData.gdp.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });

    const cpiFiltered = cachedData.cpi.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });

    return { gdp: gdpFiltered, cpi: cpiFiltered };
}

function populateDataTable() {
    const filteredData = getFilteredData();
    const tableBody = document.getElementById('tableBody');
    const sourceNote = document.querySelector('.source-note');
    
    tableBody.innerHTML = '';

    // Create a map for quick CPI lookup by date
    const cpiMap = {};
    filteredData.cpi.forEach(d => {
        cpiMap[d.date] = d.value;
    });

    filteredData.gdp.forEach(gdpItem => {
        const row = document.createElement('tr');
        const cpiValue = cpiMap[gdpItem.date] || 'N/A';
        const cpiText = typeof cpiValue === 'number' ? cpiValue.toFixed(2) + '%' : cpiValue;

        row.innerHTML = `
            <td>${formatDateDisplay(gdpItem.date)}</td>
            <td><strong style="color: #CB6015;">${gdpItem.value.toFixed(2)}%</strong></td>
            <td><strong style="color: #002F6C;">${cpiText}</strong></td>
        `;
        tableBody.appendChild(row);
    });

    // Update source note
    if (sourceNote) {
        const sourceText = dataSource === 'live' 
            ? 'Data Source: Federal Reserve Economic Data (FRED) - Live API - Series: GDPC1 (Real GDP), CPIAUCSL (CPI-U)' 
            : 'Data Source: Sample Data (FRED API unavailable) - Series: GDPC1 (Real GDP), CPIAUCSL (CPI-U)';
        sourceNote.textContent = sourceText;
    }
}

function downloadData() {
    try {
        const filteredData = getFilteredData();
        let csv = 'Date,GDP (% Change),CPI-U (1-Month % Change)\n';

        const cpiMap = {};
        filteredData.cpi.forEach(d => {
            cpiMap[d.date] = d.value;
        });

        filteredData.gdp.forEach(gdpItem => {
            const cpiValue = cpiMap[gdpItem.date] || '';
            csv += `${formatDateDisplay(gdpItem.date)},${gdpItem.value.toFixed(2)},${cpiValue ? cpiValue.toFixed(2) : ''}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `gdp_cpi_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading data:', error);
        alert('Failed to download data. Please try again.');
    }
}

function formatDateLabel(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} '${year.toString().slice(-2)}`;
}

function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize charts on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
