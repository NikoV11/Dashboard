// Monthly Report Generator for Hibbs Monitor Dashboard
// Generates a professional PDF report with all dashboard data

class MonthlyReportGenerator {
    constructor() {
        this.reportMonth = null;
        this.reportYear = null;
        this.reportData = {};
    }

    /**
     * Generate a monthly report with all dashboard data
     */
    async generateReport(month, year) {
        this.reportMonth = month;
        this.reportYear = year;
        
        try {
            // Collect all data for the report
            await this.collectReportData();
            
            // Generate HTML report
            const reportHTML = this.generateHTMLReport();
            
            // Create downloadable document
            this.downloadReport(reportHTML);
            
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report. Please check the console.');
        }
    }

    /**
     * Collect all data from dashboard sources
     */
    async collectReportData() {
        // GDP Data
        if (gdpChart && gdpChart.data.datasets.length > 0) {
            this.reportData.gdp = {
                labels: gdpChart.data.labels,
                values: gdpChart.data.datasets[0].data,
                latest: gdpChart.data.datasets[0].data[gdpChart.data.datasets[0].data.length - 1]
            };
        }

        // CPI Data
        if (cpiChart && cpiChart.data.datasets.length > 0) {
            this.reportData.cpi = {
                labels: cpiChart.data.labels,
                values: cpiChart.data.datasets[0].data,
                latest: cpiChart.data.datasets[0].data[cpiChart.data.datasets[0].data.length - 1]
            };
        }

        // Unemployment Data
        if (unemploymentChart && unemploymentChart.data.datasets.length > 0) {
            this.reportData.unemployment = {
                labels: unemploymentChart.data.labels,
                values: unemploymentChart.data.datasets[0].data,
                latest: unemploymentChart.data.datasets[0].data[unemploymentChart.data.datasets[0].data.length - 1]
            };
        }

        // Employment Data
        if (employmentChart && employmentChart.data.datasets.length > 0) {
            this.reportData.employment = {
                labels: employmentChart.data.labels,
                datasets: employmentChart.data.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data
                }))
            };
        }

        // Sales Tax Data
        if (salesTaxChart && salesTaxChart.data.datasets.length > 0) {
            this.reportData.salesTax = {
                labels: salesTaxChart.data.labels,
                values: salesTaxChart.data.datasets[0].data,
                latest: salesTaxChart.data.datasets[0].data[salesTaxChart.data.datasets[0].data.length - 1]
            };
        }

        // Median Home Price Data
        if (medianPriceChart && medianPriceChart.data.datasets.length > 0) {
            this.reportData.medianPrice = {
                labels: medianPriceChart.data.labels,
                values: medianPriceChart.data.datasets[0].data,
                latest: medianPriceChart.data.datasets[0].data[medianPriceChart.data.datasets[0].data.length - 1]
            };
        }

        // Mortgage Data
        if (mortgage30Chart && mortgage30Chart.data.datasets.length > 0) {
            this.reportData.mortgage = {
                labels: mortgage30Chart.data.labels,
                rates30: mortgage30Chart.data.datasets[0].data,
                rates15: mortgage15Chart ? mortgage15Chart.data.datasets[0].data : [],
                latest30: mortgage30Chart.data.datasets[0].data[mortgage30Chart.data.datasets[0].data.length - 1],
                latest15: mortgage15Chart ? mortgage15Chart.data.datasets[0].data[mortgage15Chart.data.datasets[0].data.length - 1] : null
            };
        }

        // Revenue Data
        if (revenueChart && revenueChart.data.labels.length > 0) {
            this.reportData.revenue = {
                labels: revenueChart.data.labels,
                values: revenueChart.data.datasets[0].data,
                total: revenueChart.data.datasets[0].data.reduce((a, b) => a + b, 0)
            };
        }
    }

    /**
     * Generate professional HTML report
     */
    generateHTMLReport() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[this.reportMonth - 1];

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hibbs Monitor - ${monthName} ${this.reportYear}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #0f172a;
            background: white;
        }
        
        @media print {
            body { background: white; }
            .page-break { page-break-after: always; }
        }
        
        .report-container {
            max-width: 8.5in;
            height: 11in;
            margin: 0 auto;
            padding: 0.5in;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #CB6015;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }
        
        .header-title {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .header-title h1 {
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
        }
        
        .header-title .subtitle {
            font-size: 14px;
            color: #4b5563;
            font-weight: 500;
        }
        
        .header-date {
            text-align: right;
            font-size: 14px;
            color: #4b5563;
        }
        
        .executive-summary {
            background: #f6f7fb;
            border-left: 4px solid #CB6015;
            padding: 16px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        
        .executive-summary h2 {
            font-size: 16px;
            color: #0f172a;
            margin-bottom: 12px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 12px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
        }
        
        .summary-label {
            color: #4b5563;
            font-weight: 500;
        }
        
        .summary-value {
            color: #0f172a;
            font-weight: 600;
        }
        
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 2px solid #CB6015;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        
        .indicator-card {
            background: #f9fafb;
            border: 1px solid #e4e7ec;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-size: 12px;
        }
        
        .indicator-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .indicator-label {
            color: #0f172a;
        }
        
        .indicator-value {
            color: #CB6015;
            font-size: 16px;
            font-weight: 700;
        }
        
        .indicator-change {
            font-size: 10px;
            color: #4b5563;
        }
        
        .mini-chart {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #e4e7ec;
        }
        
        .chart-bar {
            height: 4px;
            background: linear-gradient(90deg, #CB6015, #002F6C);
            border-radius: 2px;
            margin-bottom: 4px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 12px;
        }
        
        th {
            background: linear-gradient(120deg, rgba(203, 96, 21, 0.9), rgba(0, 47, 108, 0.92));
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 6px 8px;
            border-bottom: 1px solid #e4e7ec;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .footer {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e4e7ec;
            font-size: 10px;
            color: #4b5563;
            text-align: center;
        }
        
        .print-button {
            display: inline-block;
            padding: 12px 24px;
            background: #CB6015;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .print-button:hover {
            background: #a34c0f;
        }
        
        @media print {
            .print-button { display: none; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
    
    <div class="report-container">
        <!-- Header -->
        <div class="header">
            <div class="header-title">
                <h1>THE HIBBS MONITOR</h1>
                <div class="subtitle">UT Tyler Hibbs Institute Economic Dashboard</div>
            </div>
            <div class="header-date">
                <strong>${monthName} ${this.reportYear}</strong><br>
                Generated: ${new Date().toLocaleDateString()}
            </div>
        </div>
        
        <!-- Executive Summary -->
        <div class="executive-summary">
            <h2>Executive Summary</h2>
            <div class="summary-grid">
                ${this.generateSummaryItems()}
            </div>
        </div>
        
        <!-- US Indicators Section -->
        <div class="section">
            <h2 class="section-title">US Economic Indicators</h2>
            ${this.generateUSIndicators()}
        </div>
        
        <!-- Regional Indicators Section -->
        <div class="section">
            <h2 class="section-title">Regional Indicators (Tyler MSA)</h2>
            ${this.generateRegionalIndicators()}
        </div>
        
        <!-- Detailed Data Tables -->
        <div class="page-break"></div>
        <div class="section">
            <h2 class="section-title">Detailed Data</h2>
            ${this.generateDetailedTables()}
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Data Sources:</strong> Federal Reserve Economic Data (FRED), Texas Comptroller of Public Accounts, Freddie Mac Primary Mortgage Market Survey, Bureau of Labor Statistics</p>
            <p>Tyler MSA includes: Tyler, Lindale, Whitehouse, Bullard, Troup, Noonday, Arp, Winona, and New Chapel Hill</p>
            <p style="margin-top: 12px;">© ${new Date().getFullYear()} UT Tyler Hibbs Institute | All rights reserved</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Generate summary items for executive summary
     */
    generateSummaryItems() {
        let html = '';

        if (this.reportData.gdp) {
            html += `
                <div class="summary-item">
                    <span class="summary-label">US Real GDP Growth:</span>
                    <span class="summary-value">${this.reportData.gdp.latest?.toFixed(2) || 'N/A'}%</span>
                </div>
            `;
        }

        if (this.reportData.cpi) {
            html += `
                <div class="summary-item">
                    <span class="summary-label">US Inflation (CPI-U):</span>
                    <span class="summary-value">${this.reportData.cpi.latest?.toFixed(2) || 'N/A'}%</span>
                </div>
            `;
        }

        if (this.reportData.unemployment) {
            html += `
                <div class="summary-item">
                    <span class="summary-label">US Unemployment Rate:</span>
                    <span class="summary-value">${this.reportData.unemployment.latest?.toFixed(2) || 'N/A'}%</span>
                </div>
            `;
        }

        if (this.reportData.salesTax) {
            html += `
                <div class="summary-item">
                    <span class="summary-label">Tyler MSA Sales Tax:</span>
                    <span class="summary-value">${this.reportData.salesTax.latest?.toFixed(2) || 'N/A'}%</span>
                </div>
            `;
        }

        return html;
    }

    /**
     * Generate US indicators section
     */
    generateUSIndicators() {
        let html = '';

        if (this.reportData.gdp) {
            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">Real GDP Growth (Quarterly)</span>
                        <span class="indicator-value">${this.reportData.gdp.latest?.toFixed(2)}%</span>
                    </div>
                    <div class="indicator-change">FRED Series: A191RL1Q225SBEA</div>
                    <div class="mini-chart">
                        ${this.reportData.gdp.values.slice(-4).map(v => `<div class="chart-bar" style="width: ${Math.abs(v) * 5}%"></div>`).join('')}
                    </div>
                </div>
            `;
        }

        if (this.reportData.cpi) {
            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">CPI-U Inflation (Monthly MoM%)</span>
                        <span class="indicator-value">${this.reportData.cpi.latest?.toFixed(2)}%</span>
                    </div>
                    <div class="indicator-change">FRED Series: CPIAUCSL</div>
                    <div class="mini-chart">
                        ${this.reportData.cpi.values.slice(-12).map(v => `<div class="chart-bar" style="width: ${Math.abs(v) * 10}%"></div>`).join('')}
                    </div>
                </div>
            `;
        }

        if (this.reportData.unemployment) {
            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">Unemployment Rate</span>
                        <span class="indicator-value">${this.reportData.unemployment.latest?.toFixed(2)}%</span>
                    </div>
                    <div class="indicator-change">FRED Series: UNRATE</div>
                    <div class="mini-chart">
                        ${this.reportData.unemployment.values.slice(-12).map(v => `<div class="chart-bar" style="width: ${v * 3}%"></div>`).join('')}
                    </div>
                </div>
            `;
        }

        if (this.reportData.mortgage) {
            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">Mortgage Rates</span>
                        <span class="indicator-value">${this.reportData.mortgage.latest30?.toFixed(2)}% / ${this.reportData.mortgage.latest15?.toFixed(2)}%</span>
                    </div>
                    <div class="indicator-change">30-year / 15-year Fixed (Freddie Mac)</div>
                </div>
            `;
        }

        return html;
    }

    /**
     * Generate regional indicators section
     */
    generateRegionalIndicators() {
        let html = '';

        if (this.reportData.employment && this.reportData.employment.datasets) {
            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">Employment Trends (MoM%)</span>
                    </div>
                    <div class="indicator-change">Tyler MSA vs Texas Non-Farm Payroll</div>
                    <table>
                        <tr>
                            <th>Region</th>
                            <th>Latest</th>
                        </tr>
                        ${this.reportData.employment.datasets.map(ds => {
                            const latest = ds.data[ds.data.length - 1];
                            return `<tr><td>${ds.label}</td><td>${latest?.toFixed(2)}%</td></tr>`;
                        }).join('')}
                    </table>
                </div>
            `;
        }

        if (this.reportData.salesTax) {
            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">Sales Tax Collections</span>
                        <span class="indicator-value">${this.reportData.salesTax.latest?.toFixed(2)}%</span>
                    </div>
                    <div class="indicator-change">Tyler MSA 9-City Aggregate (Texas Comptroller)</div>
                    <div class="mini-chart">
                        ${this.reportData.salesTax.values.slice(-6).map(v => `<div class="chart-bar" style="width: ${Math.abs(v) * 8}%"></div>`).join('')}
                    </div>
                </div>
            `;
        }

        if (this.reportData.medianPrice) {
            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">Median Listing Price Growth (MoM%)</span>
                        <span class="indicator-value">${this.reportData.medianPrice.latest?.toFixed(2)}%</span>
                    </div>
                    <div class="indicator-change">FRED Series: MEDLISPRIMM46340</div>
                    <div class="mini-chart">
                        ${this.reportData.medianPrice.values.slice(-12).map(v => `<div class="chart-bar" style="width: ${(v + 5) * 3}%"></div>`).join('')}
                    </div>
                </div>
            `;
        }

        if (this.reportData.revenue) {
            const top5 = this.reportData.revenue.labels
                .map((label, i) => ({ label, value: this.reportData.revenue.values[i] }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            html += `
                <div class="indicator-card">
                    <div class="indicator-header">
                        <span class="indicator-label">Texas Tax Collections (Top 5)</span>
                        <span class="indicator-value">$${(this.reportData.revenue.total / 1000).toFixed(0)}B</span>
                    </div>
                    <div class="indicator-change">Tax Collections Only (FY)</div>
                    <table>
                        <tr>
                            <th>Category</th>
                            <th>% of Total</th>
                        </tr>
                        ${top5.map(item => `<tr><td>${item.label}</td><td>${((item.value / this.reportData.revenue.total) * 100).toFixed(1)}%</td></tr>`).join('')}
                    </table>
                </div>
            `;
        }

        return html;
    }

    /**
     * Generate detailed data tables
     */
    generateDetailedTables() {
        let html = '';

        if (this.reportData.cpi) {
            const last12 = this.reportData.cpi.labels.slice(-12).map((label, i) => 
                `<tr><td>${label}</td><td>${this.reportData.cpi.values[this.reportData.cpi.values.length - 12 + i]?.toFixed(3)}%</td></tr>`
            ).join('');

            html += `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #0f172a;">CPI-U Monthly Data (Last 12 Months)</h3>
                    <table>
                        <tr>
                            <th>Month</th>
                            <th>MoM Change (%)</th>
                        </tr>
                        ${last12}
                    </table>
                </div>
            `;
        }

        return html;
    }

    /**
     * Download the report as HTML/PDF
     */
    downloadReport(htmlContent) {
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        document.body.appendChild(element);

        // For print-to-PDF functionality
        setTimeout(() => {
            window.print();
        }, 100);
    }
}

// Create global instance
const reportGenerator = new MonthlyReportGenerator();
