// FRED API Configuration
const FRED_API_KEY = '60702495b0f5bcf665cfe1db3ae9dbe0';
const FRED_API_URL = '/.netlify/functions/fred-proxy'; // Netlify serverless function

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
        fetchFREDData();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

async function fetchFREDData() {
    try {
        // Check cache (5 minute cache)
        if (cachedData && lastFetchTime && Date.now() - lastFetchTime < 5 * 60 * 1000) {
            console.log('Using cached data');
            initializeCharts();
            populateDataTable();
            setupEventListeners();
            return;
        }

        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.className = 'loading-indicator';
        loadingDiv.textContent = 'Fetching live data from FRED...';
        loadingDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #CB6015; color: white; padding: 10px 20px; border-radius: 4px; z-index: 1000; font-size: 14px;';
        document.body.appendChild(loadingDiv);
        console.log('Loading indicator shown');

        console.log('Fetching FRED data...');
        const [gdpData, cpiData] = await Promise.all([
            fetchFREDSeries(GDPC1_ID),
            fetchFREDSeries(CPIAUCSL_ID)
        ]);

        console.log('Data fetched successfully, calculating percent changes...');
        cachedData = {
            gdp: calculatePercentChange(gdpData, 'quarterly'),
            cpi: calculatePercentChange(cpiData, 'monthly')
        };

        lastFetchTime = Date.now();
        
        // Remove loading indicator
        const loader = document.getElementById('loading-indicator');
        if (loader && document.body.contains(loader)) {
            document.body.removeChild(loader);
        }

        console.log('Live data loaded successfully');
        dataSource = 'live';
        initializeCharts();
        populateDataTable();
        setupEventListeners();
    } catch (error) {
        console.error('Error fetching FRED data:', error);
        const loader = document.getElementById('loading-indicator');
        if (loader && document.body.contains(loader)) {
            document.body.removeChild(loader);
        }
        showErrorMessage('Failed to load live data. Check console for details. Using sample data instead.');
        useSampleData();
    }
}

async function fetchFREDSeries(seriesId) {
    console.log(`Fetching ${seriesId}...`);
    
    // Use Netlify function endpoint with query parameter
    const endpoint = `${FRED_API_URL}?seriesId=${seriesId}`;
    
    try {
        console.log(`Attempting to fetch from Netlify function: ${endpoint}...`);
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

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
            console.warn(`Server returned status ${response.status}: ${errorText}`);
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

function useSampleData() {
    dataSource = 'sample';
    cachedData = {
        gdp: [
            { date: '2020-01-01', value: -31.4 },
            { date: '2020-04-01', value: -31.1 },
            { date: '2020-07-01', value: 33.8 },
            { date: '2020-10-01', value: 4.5 },
            { date: '2021-01-01', value: 6.3 },
            { date: '2021-04-01', value: 6.7 },
            { date: '2021-07-01', value: 2.3 },
            { date: '2021-10-01', value: 5.5 },
            { date: '2022-01-01', value: -1.4 },
            { date: '2022-04-01', value: -0.6 },
            { date: '2022-07-01', value: 2.6 },
            { date: '2022-10-01', value: 3.2 },
            { date: '2023-01-01', value: 1.1 },
            { date: '2023-04-01', value: 1.3 },
            { date: '2023-07-01', value: 2.1 },
            { date: '2023-10-01', value: 1.2 },
            { date: '2024-01-01', value: 2.2 },
            { date: '2024-04-01', value: 0.6 },
            { date: '2024-07-01', value: 1.4 },
            { date: '2024-10-01', value: 0.9 }
        ],
        cpi: [
            { date: '2020-01-01', value: 0.3 },
            { date: '2020-02-01', value: 0.3 },
            { date: '2020-03-01', value: 0.4 },
            { date: '2020-04-01', value: 0.3 },
            { date: '2020-05-01', value: 0.1 },
            { date: '2020-06-01', value: 0.6 },
            { date: '2020-07-01', value: 0.6 },
            { date: '2020-08-01', value: 0.4 },
            { date: '2020-09-01', value: 0.2 },
            { date: '2020-10-01', value: 0.0 },
            { date: '2020-11-01', value: 0.2 },
            { date: '2020-12-01', value: 0.4 },
            { date: '2021-01-01', value: 0.4 },
            { date: '2021-02-01', value: 0.6 },
            { date: '2021-03-01', value: 0.6 },
            { date: '2021-04-01', value: 0.8 },
            { date: '2021-05-01', value: 0.5 },
            { date: '2021-06-01', value: 0.9 },
            { date: '2021-07-01', value: 0.5 },
            { date: '2021-08-01', value: 0.7 },
            { date: '2021-09-01', value: 0.4 },
            { date: '2021-10-01', value: 0.9 },
            { date: '2021-11-01', value: 0.8 },
            { date: '2021-12-01', value: 0.7 },
            { date: '2022-01-01', value: 0.5 },
            { date: '2022-02-01', value: 0.8 },
            { date: '2022-03-01', value: 1.2 },
            { date: '2022-04-01', value: 0.3 },
            { date: '2022-05-01', value: 1.0 },
            { date: '2022-06-01', value: 1.3 },
            { date: '2022-07-01', value: 0.0 },
            { date: '2022-08-01', value: 0.1 },
            { date: '2022-09-01', value: 0.8 },
            { date: '2022-10-01', value: 0.6 },
            { date: '2022-11-01', value: 0.1 },
            { date: '2022-12-01', value: 0.1 },
            { date: '2023-01-01', value: 0.5 },
            { date: '2023-02-01', value: 0.4 },
            { date: '2023-03-01', value: 0.5 },
            { date: '2023-04-01', value: 0.4 },
            { date: '2023-05-01', value: 0.1 },
            { date: '2023-06-01', value: 0.3 },
            { date: '2023-07-01', value: 0.2 },
            { date: '2023-08-01', value: 0.6 },
            { date: '2023-09-01', value: 0.4 },
            { date: '2023-10-01', value: 0.4 },
            { date: '2023-11-01', value: 0.3 },
            { date: '2023-12-01', value: 0.3 },
            { date: '2024-01-01', value: 0.3 },
            { date: '2024-02-01', value: 0.4 },
            { date: '2024-03-01', value: 0.4 },
            { date: '2024-04-01', value: 0.3 },
            { date: '2024-05-01', value: 0.0 },
            { date: '2024-06-01', value: 0.1 },
            { date: '2024-07-01', value: 0.2 },
            { date: '2024-08-01', value: 0.2 },
            { date: '2024-09-01', value: 0.2 },
            { date: '2024-10-01', value: 0.2 }
        ]
    };

    console.log('Sample data loaded as fallback');
    initializeCharts();
    populateDataTable();
    setupEventListeners();
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
