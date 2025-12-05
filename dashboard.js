// Sample data structure (replace with real FRED API calls or local data source)
const sampleData = {
    gdp: [
        { date: '2023-01-01', value: 1.6 },
        { date: '2023-04-01', value: 0.8 },
        { date: '2023-07-01', value: 2.1 },
        { date: '2023-10-01', value: 1.2 },
        { date: '2024-01-01', value: 2.5 },
        { date: '2024-04-01', value: 0.6 },
        { date: '2024-07-01', value: 1.4 },
        { date: '2024-10-01', value: 0.9 }
    ],
    cpi: [
        { date: '2023-01-01', value: 0.5 },
        { date: '2023-02-01', value: -0.1 },
        { date: '2023-03-01', value: 0.4 },
        { date: '2023-04-01', value: 0.2 },
        { date: '2023-05-01', value: 0.0 },
        { date: '2023-06-01', value: 0.1 },
        { date: '2024-01-01', value: 0.3 },
        { date: '2024-02-01', value: 0.2 },
        { date: '2024-03-01', value: 0.4 },
        { date: '2024-04-01', value: 0.0 },
        { date: '2024-05-01', value: 0.1 },
        { date: '2024-06-01', value: 0.1 }
    ]
};

let gdpChart = null;
let cpiChart = null;

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    populateDataTable();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('updateBtn').addEventListener('click', updateCharts);
    document.getElementById('downloadBtn').addEventListener('click', downloadData);
}

function initializeCharts() {
    const gdpCtx = document.getElementById('gdpChart').getContext('2d');
    const cpiCtx = document.getElementById('cpiChart').getContext('2d');

    const filteredData = getFilteredData();

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
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: '600' },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 10,
                    titleFont: { size: 12, weight: '600' },
                    bodyFont: { size: 11 },
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
                        font: { size: 10 }
                    }
                }
            }
        }
    });

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
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: '600' },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 10,
                    titleFont: { size: 12, weight: '600' },
                    bodyFont: { size: 11 },
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
                        font: { size: 10 }
                    }
                }
            }
        }
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

    const gdpFiltered = sampleData.gdp.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });

    const cpiFiltered = sampleData.cpi.filter(d => {
        const year = new Date(d.date).getFullYear();
        return year >= startYear && year <= endYear;
    });

    return { gdp: gdpFiltered, cpi: cpiFiltered };
}

function populateDataTable() {
    const filteredData = getFilteredData();
    const tableBody = document.getElementById('tableBody');
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
}

function downloadData() {
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

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdp_cpi_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
