/**
 * Stacked Bar Chart for Monthly Tax Revenue by Category (Single Fiscal Year)
 * Parses Texas Comptroller historical all funds data
 */

class TaxCategoryChart {
    constructor(canvasId, dropdownId, options = {}) {
        this.canvasId = canvasId;
        this.dropdownId = dropdownId;
        this.chart = null;
        this.excelData = null;
        this.options = options;
        
        // Month order for fiscal year (September through August)
        this.monthOrder = [
            'September', 'October', 'November', 'December',
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August'
        ];
        
        // Color palette for different tax categories
        this.categoryColors = {
            'Sales Taxes': '#CB6015',
            'Franchise Tax': '#002F6C',
            'Motor Fuels Tax': '#FF6B6B',
            'Motor Vehicle Sales Tax': '#4ECDC4',
            'Alcoholic Beverage Taxes': '#95E1D3',
            'Natural Gas Production Tax': '#FFE66D',
            'Oil Production Tax': '#A8E6CF',
            'Cigarette Tax': '#FF8CC3',
            'Tobacco Tax': '#FFB84D',
            'Inheritance Tax': '#B19CD9',
            'Utility Tax': '#87CEEB',
            'Other Taxes': '#DDA0DD'
        };
    }

    /**
     * Load Excel data and initialize
     */
    async init() {
        try {
            console.log('[TaxChart] Initializing...');
            
            // Fetch Excel data
            this.excelData = await ExcelDataLoader.load();
            console.log('[TaxChart] Loaded sheets:', Object.keys(this.excelData));

            // Extract fiscal years and populate dropdown
            const fiscalYears = Object.keys(this.excelData)
                .filter(name => name.match(/^FY\s*\d{4}$/))
                .sort((a, b) => {
                    const yearA = parseInt(a.match(/\d{4}/)[0]);
                    const yearB = parseInt(b.match(/\d{4}/)[0]);
                    return yearB - yearA; // Newest first
                });

            console.log('[TaxChart] Found fiscal years:', fiscalYears);

            if (fiscalYears.length === 0) {
                throw new Error('No fiscal year sheets found in Excel file');
            }

            // Populate dropdown
            this.populateDropdown(fiscalYears);

            // Render chart for first (most recent) fiscal year
            await this.renderYear(fiscalYears[0]);

            console.log('[TaxChart] Initialized successfully');
        } catch (error) {
            console.error('[TaxChart] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Populate fiscal year dropdown
     */
    populateDropdown(fiscalYears) {
        const dropdown = document.getElementById(this.dropdownId);
        if (!dropdown) {
            console.warn(`[TaxChart] Dropdown element not found: ${this.dropdownId}`);
            return;
        }

        dropdown.innerHTML = '';
        fiscalYears.forEach(fy => {
            const option = document.createElement('option');
            option.value = fy;
            option.textContent = fy;
            dropdown.appendChild(option);
        });

        // Add event listener for dropdown changes
        dropdown.addEventListener('change', (e) => {
            this.renderYear(e.target.value);
        });
    }

    /**
     * Render chart for selected fiscal year
     */
    async renderYear(fiscalYear) {
        try {
            console.log(`[TaxChart] Rendering ${fiscalYear}...`);

            const sheetData = this.excelData[fiscalYear];
            if (!sheetData) {
                throw new Error(`Sheet not found: ${fiscalYear}`);
            }

            // Parse the sheet data
            const processedData = this.processSheetData(sheetData);
            
            // Create chart
            this.createChart(processedData, fiscalYear);
            
            console.log(`[TaxChart] Rendered ${fiscalYear} successfully`);
        } catch (error) {
            console.error(`[TaxChart] Failed to render ${fiscalYear}:`, error);
            throw error;
        }
    }

    /**
     * Process fiscal year sheet data into monthly stacked format
     * Input: Array of rows from Excel sheet
     * Output: { months: [Sep, Oct, ...], datasets: [{label, data, color}, ...] }
     */
    processSheetData(sheetData) {
        const monthData = new Map();
        let categories = [];

        // Initialize month map
        this.monthOrder.forEach(month => {
            monthData.set(month, {});
        });

        // Skip header rows and find data
        let dataStartIdx = 0;
        
        // Look for "Tax Category" header row
        for (let i = 0; i < sheetData.length; i++) {
            const firstCol = Object.values(sheetData[i])[0];
            if (typeof firstCol === 'string' && firstCol.includes('Tax Category')) {
                dataStartIdx = i + 1;
                break;
            }
        }

        console.log(`[TaxChart] Data starts at row ${dataStartIdx}`);

        // Process data rows
        for (let i = dataStartIdx; i < sheetData.length; i++) {
            const row = sheetData[i];
            const rowKeys = Object.keys(row);
            const categoryName = Object.values(row)[0];

            // Skip if no category or if it's a total row
            if (!categoryName || typeof categoryName !== 'string') continue;
            if (categoryName.toLowerCase().includes('total') || categoryName.toLowerCase().includes('grand')) continue;

            const cleanCategory = categoryName.trim();
            categories.push(cleanCategory);

            // Extract monthly values
            let monthIdx = 0;
            for (let j = 1; j < rowKeys.length && monthIdx < this.monthOrder.length; j++) {
                const value = parseFloat(row[rowKeys[j]]) || 0;
                const month = this.monthOrder[monthIdx];

                if (monthData.has(month)) {
                    monthData.get(month)[cleanCategory] = value;
                }

                monthIdx++;
            }
        }

        // Remove duplicates from categories
        categories = [...new Set(categories)].sort();

        console.log(`[TaxChart] Found ${categories.length} categories, ${monthData.size} months`);
        if (categories.length > 0) {
            console.log(`[TaxChart] Categories:`, categories);
        }

        // Create datasets for each category
        const datasets = categories.map(category => {
            const data = this.monthOrder.map(month => {
                const monthObj = monthData.get(month) || {};
                return monthObj[category] || 0;
            });

            const color = this.getColor(category);

            return {
                label: category,
                data: data,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            };
        });

        return {
            labels: this.monthOrder,
            datasets: datasets
        };
    }

    /**
     * Get color for a category (use predefined or generate)
     */
    getColor(category) {
        if (this.categoryColors[category]) {
            return this.categoryColors[category];
        }

        // Generate a consistent color for unknown categories
        const hash = category.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);

        const colors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#FFE66D', '#A8E6CF', '#FF8CC3', '#FFB84D', '#B19CD9', '#87CEEB', '#DDA0DD'];
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Create Chart.js stacked bar chart
     */
    createChart(chartData, fiscalYear) {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            throw new Error(`Canvas element not found: ${this.canvasId}`);
        }

        // Destroy existing chart if any
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = canvas.getContext('2d');

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'x', // Vertical bars
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Revenue'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return '$' + (value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'M';
                                } else if (value >= 1000) {
                                    return '$' + (value / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'K';
                                }
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Texas Tax Revenue by Category - ${fiscalYear}`,
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            maxHeight: 100
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y || 0;
                                let formatted = value.toLocaleString(undefined, { maximumFractionDigits: 0 });
                                if (value >= 1000000) {
                                    formatted = (value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + 'M';
                                }
                                return label + ': $' + formatted;
                            },
                            afterLabel: function(context) {
                                // Show total for month
                                const month = context.label;
                                const total = context.chart.data.datasets
                                    .reduce((sum, ds) => {
                                        const dataIdx = context.dataIndex;
                                        return sum + (ds.data[dataIdx] || 0);
                                    }, 0);
                                let formatted = total.toLocaleString(undefined, { maximumFractionDigits: 0 });
                                if (total >= 1000000) {
                                    formatted = (total / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + 'M';
                                }
                                return 'Month Total: $' + formatted;
                            }
                        }
                    },
                    datalabels: {
                        display: false
                    }
                }
            }
        });

        console.log('[TaxChart] Chart created successfully');
        return this.chart;
    }

    /**
     * Get chart instance
     */
    getChart() {
        return this.chart;
    }

    /**
     * Destroy chart
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// =============================================================================
// Initialize on page load
// =============================================================================

/**
 * Initialize tax chart on page load
 */
async function initTaxChart() {
    try {
        console.log('[Dashboard] Initializing tax revenue chart...');
        
        const taxChart = new TaxCategoryChart('taxChart', 'taxYearSelect');
        await taxChart.init();
        window.taxChart = taxChart;

        console.log('[Dashboard] Tax chart initialized');
    } catch (error) {
        console.error('[Dashboard] Failed to initialize tax chart:', error);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaxCategoryChart, initTaxChart };
}
