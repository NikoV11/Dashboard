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
     * Generate professional HTML report in exact Hibbs Monitor format
     */
    generateHTMLReport() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[this.reportMonth - 1];
        const today = new Date();
        const dateStr = `${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Hibbs Monitor - ${monthName} ${this.reportYear}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            width: 8.5in;
            height: 11in;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: Calibri, Georgia, 'Times New Roman', serif;
            color: #1a1a1a;
            background: white;
            line-height: 1.3;
        }
        
        @page {
            size: letter;
            margin: 0;
        }
        
        .page {
            width: 8.5in;
            height: 11in;
            margin: 0;
            padding: 0.5in;
            background: white;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* COVER PAGE */
        .cover-page {
            justify-content: center;
            align-items: center;
            background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
        }
        
        .cover-content {
            text-align: center;
        }
        
        .cover-month-year {
            font-size: 13px;
            color: #666;
            margin-bottom: 0.8in;
            font-weight: normal;
            letter-spacing: 1px;
        }
        
        .cover-title {
            font-size: 72px;
            font-weight: bold;
            color: #000;
            letter-spacing: 4px;
            line-height: 1;
            margin: 0;
            margin-bottom: 0.3in;
        }
        
        .cover-subtitle {
            font-size: 17px;
            color: #555;
            letter-spacing: 3px;
            margin-bottom: 0.8in;
            font-weight: normal;
        }
        
        .cover-institution {
            font-size: 11px;
            color: #777;
            line-height: 1.8;
        }
        
        .cover-institution p {
            margin: 3px 0;
        }
        
        /* DATA PAGES */
        .data-page {
            overflow: hidden;
        }
        
        .page-header {
            font-size: 32px;
            font-weight: bold;
            color: #000;
            margin-bottom: 0.3in;
            letter-spacing: 2px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.25in;
            flex: 1;
            margin-bottom: 0.2in;
        }
        
        .metric-box {
            background: #fafbfc;
            border: 1px solid #d4d8dc;
            padding: 0.18in;
            font-size: 10px;
            display: flex;
            flex-direction: column;
        }
        
        .metric-label {
            font-size: 10px;
            font-weight: bold;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .metric-sublabel {
            font-size: 9px;
            color: #888;
            margin-bottom: 8px;
            font-style: italic;
        }
        
        .metric-value {
            font-size: 40px;
            font-weight: bold;
            color: #CA5F15;
            line-height: 1;
            margin-bottom: 8px;
        }
        
        .metric-body {
            font-size: 9px;
            color: #333;
            line-height: 1.4;
            margin-bottom: 6px;
            flex-grow: 1;
        }
        
        .metric-source {
            font-size: 8px;
            color: #888;
            border-top: 1px solid #d4d8dc;
            padding-top: 6px;
            line-height: 1.3;
        }
        
        .metric-box.full-width {
            grid-column: 1 / -1;
        }
        
        .page-footer {
            font-size: 8px;
            color: #666;
            border-top: 1px solid #d4d8dc;
            padding-top: 8px;
            line-height: 1.4;
        }
        
        /* CONTACT PAGE */
        .contact-page {
            justify-content: center;
            align-items: center;
        }
        
        .contact-content {
            text-align: center;
        }
        
        .contact-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 0.4in;
            letter-spacing: 2px;
        }
        
        .contact-section {
            margin-bottom: 0.4in;
        }
        
        .contact-section h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        
        .contact-section p {
            font-size: 11px;
            margin: 6px 0;
            line-height: 1.5;
        }
        
        .contact-divider {
            border-top: 1px solid #ddd;
            margin: 0.3in 0;
            padding-top: 0.3in;
        }
        
        .citation {
            font-size: 9px;
            line-height: 1.6;
            color: #555;
        }
        
        .copyright {
            font-size: 8px;
            color: #999;
            margin-top: 0.3in;
        }
        
        .copyright p {
            margin: 4px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        
        table tr {
            border-bottom: 1px solid #e0e0e0;
        }
        
        table td {
            padding: 5px 0;
            font-size: 9px;
        }
        
        table td:first-child {
            text-align: left;
        }
        
        table td:last-child {
            text-align: right;
        }
        
        .print-button {
            display: block;
            padding: 12px 24px;
            background: #CA5F15;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            margin-bottom: 20px;
            font-size: 14px;
            margin-left: 20px;
        }
        
        .print-button:hover {
            background: #a34c0f;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .print-button {
                display: none !important;
            }
            .page {
                page-break-after: always;
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
    
    <!-- PAGE 1: COVER -->
    <div class="page cover-page">
        <div class="cover-content">
            <div class="cover-month-year">${monthName.toUpperCase()} ${this.reportYear}</div>
            <div class="cover-title">THE HIBBS<br>MONITOR</div>
            <div class="cover-subtitle">TRACKING THE ECONOMY</div>
            <div class="cover-institution">
                <p>Hibbs Institute for Business and Economic Research</p>
                <p>Soules College of Business</p>
                <p>University of Texas at Tyler</p>
            </div>
        </div>
    </div>
    
    <!-- PAGE 2: US INDICATORS -->
    <div class="page data-page">
        <div class="page-header">THE U.S.</div>
        
        <div class="metrics-grid">
            <!-- Real GDP -->
            <div class="metric-box">
                <div class="metric-label">Real GDP</div>
                <div class="metric-sublabel">Quarterly % change (annualized)</div>
                <div class="metric-value">${this.reportData.gdp?.latest?.toFixed(2) || 'N/A'}%</div>
                <div class="metric-body">
                    Real gross domestic product increased at an annual rate of ${this.reportData.gdp?.latest?.toFixed(2) || 'N/A'}% in Q${Math.floor((this.reportMonth + 2) / 3)} ${this.reportYear}.
                </div>
                <div class="metric-source">
                    Source: Federal Reserve Economic Data (FRED)<br>
                    Series A191RL1Q225SBEA
                </div>
            </div>
            
            <!-- CPI-U -->
            <div class="metric-box">
                <div class="metric-label">CPI-U</div>
                <div class="metric-sublabel">One-month percent change</div>
                <div class="metric-value">${this.reportData.cpi?.latest?.toFixed(2) || 'N/A'}%</div>
                <div class="metric-body">
                    Consumer Price Index for All Urban Consumers changed ${this.reportData.cpi?.latest?.toFixed(2) || 'N/A'}% in ${monthName} ${this.reportYear}.
                </div>
                <div class="metric-source">
                    Source: Federal Reserve Economic Data (FRED)<br>
                    Series CPIAUCSL
                </div>
            </div>
            
            <!-- Unemployment -->
            <div class="metric-box">
                <div class="metric-label">Unemployment Rate</div>
                <div class="metric-sublabel">Latest monthly figure</div>
                <div class="metric-value">${this.reportData.unemployment?.latest?.toFixed(1) || 'N/A'}%</div>
                <div class="metric-body">
                    The unemployment rate was ${this.reportData.unemployment?.latest?.toFixed(1) || 'N/A'}% in the most recent month.
                </div>
                <div class="metric-source">
                    Source: Federal Reserve Economic Data (FRED)<br>
                    Series UNRATE
                </div>
            </div>
            
            <!-- Federal Funds Rate -->
            <div class="metric-box">
                <div class="metric-label">Federal Funds Rate</div>
                <div class="metric-sublabel">Target range</div>
                <div class="metric-value">3.75% - 4.0%</div>
                <div class="metric-body">
                    The Federal Reserve's current target range for the federal funds rate.
                </div>
                <div class="metric-source">
                    Source: Federal Reserve
                </div>
            </div>
            
            <!-- Mortgage Rates -->
            <div class="metric-box">
                <div class="metric-label">Mortgage Rates (30-YR & 15-YR)</div>
                <div class="metric-sublabel">Primary Mortgage Market Survey</div>
                <table>
                    <tr>
                        <td><strong>30-Year Fixed:</strong></td>
                        <td><strong>${this.reportData.mortgage?.latest30?.toFixed(2) || 'N/A'}%</strong></td>
                    </tr>
                    <tr>
                        <td><strong>15-Year Fixed:</strong></td>
                        <td><strong>${this.reportData.mortgage?.latest15?.toFixed(2) || 'N/A'}%</strong></td>
                    </tr>
                </table>
                <div class="metric-source">
                    Source: Freddie Mac Primary Mortgage Market Survey
                </div>
            </div>
        </div>
        
        <div class="page-footer">
            <strong>Data Sources:</strong> Federal Reserve Economic Data (FRED), U.S. Bureau of Labor Statistics, Freddie Mac<br>
            <strong>Report Date:</strong> ${dateStr}
        </div>
    </div>
    
    <!-- PAGE 3: REGIONAL INDICATORS -->
    <div class="page data-page">
        <div class="page-header">REGIONAL (TYLER MSA)</div>
        
        <div class="metrics-grid">
            <!-- Employment -->
            <div class="metric-box">
                <div class="metric-label">Employment Growth</div>
                <div class="metric-sublabel">Year-over-year % change</div>
                ${this.reportData.employment?.datasets ? `
                    <table>
                        <tr style="border: none;">
                            <td style="font-weight: bold;">Tyler MSA:</td>
                            <td style="font-weight: bold; text-align: right;">${this.reportData.employment.datasets[0]?.data[this.reportData.employment.datasets[0]?.data.length - 1]?.toFixed(2) || 'N/A'}%</td>
                        </tr>
                        <tr>
                            <td>Texas:</td>
                            <td style="text-align: right;">${this.reportData.employment.datasets[1]?.data[this.reportData.employment.datasets[1]?.data.length - 1]?.toFixed(2) || 'N/A'}%</td>
                        </tr>
                    </table>
                ` : `<div style="color: #888; font-size: 9px; margin: 8px 0;">Data not available</div>`}
                <div class="metric-source">
                    Source: Bureau of Labor Statistics
                </div>
            </div>
            
            <!-- Sales Tax -->
            <div class="metric-box">
                <div class="metric-label">Sales Tax Collections</div>
                <div class="metric-sublabel">Tyler MSA month-over-month</div>
                <div class="metric-value">${this.reportData.salesTax?.latest?.toFixed(2) || 'N/A'}%</div>
                <div class="metric-body">
                    Sales tax collections in Tyler MSA changed ${this.reportData.salesTax?.latest?.toFixed(2) || 'N/A'}% from the previous month.
                </div>
                <div class="metric-source">
                    Source: Texas Comptroller of Public Accounts
                </div>
            </div>
            
            <!-- Median Home Price -->
            <div class="metric-box">
                <div class="metric-label">Median Listing Price</div>
                <div class="metric-sublabel">Tyler MSA month-over-month</div>
                <div class="metric-value">${this.reportData.medianPrice?.latest?.toFixed(2) || 'N/A'}%</div>
                <div class="metric-body">
                    The median listing price in Tyler MSA changed ${this.reportData.medianPrice?.latest?.toFixed(2) || 'N/A'}% from the previous month.
                </div>
                <div class="metric-source">
                    Source: Federal Reserve Economic Data (FRED)<br>
                    Series MEDLISPRIMM46340
                </div>
            </div>
            
            <!-- Tax Collections -->
            ${this.reportData.revenue ? `
                <div class="metric-box full-width">
                    <div class="metric-label">Texas Tax Collections</div>
                    <div class="metric-sublabel">State fiscal year receipts by category</div>
                    ${(() => {
                        const top5 = this.reportData.revenue.labels
                            .map((label, i) => ({ label, value: this.reportData.revenue.values[i] }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 5);
                        return `
                            <table>
                                <tr>
                                    <td style="font-weight: bold;">Category</td>
                                    <td style="font-weight: bold;">% of Total</td>
                                </tr>
                                ${top5.map(item => `<tr>
                                    <td>${item.label}</td>
                                    <td>${((item.value / this.reportData.revenue.total) * 100).toFixed(1)}%</td>
                                </tr>`).join('')}
                            </table>
                        `;
                    })()}
                    <div class="metric-source">
                        <strong>Total Revenue:</strong> $${(this.reportData.revenue.total / 1000000).toFixed(2)}M<br>
                        Source: Texas Comptroller of Public Accounts
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div class="page-footer">
            <strong>Regional Definition:</strong> Tyler MSA includes Tyler, Lindale, Whitehouse, Bullard, Troup, Noonday, Arp, Winona, and New Chapel Hill<br>
            <strong>Report Date:</strong> ${dateStr}
        </div>
    </div>
    
    <!-- PAGE 4: CONTACT & INFORMATION -->
    <div class="page contact-page">
        <div class="contact-content">
            <div class="contact-title">HIBBS INSTITUTE</div>
            
            <div class="contact-section">
                <h3>FOR MORE INFORMATION</h3>
                <p><strong>Website:</strong><br>www.uttyler.edu/hibbs-institute</p>
                <p><strong>Email:</strong><br>HibbsInstitute@uttyler.edu</p>
                <p><strong>Phone:</strong><br>903.565.5952</p>
            </div>
            
            <div class="contact-divider"></div>
            
            <div class="contact-section">
                <h3>SUGGESTED CITATION</h3>
                <div class="citation">
                    Hibbs Institute for Business and Economic Research (${monthName}, ${this.reportYear}). 
                    The Hibbs Monitor (Report No. ${this.reportYear}-${String(this.reportMonth).padStart(2, '0')}-HM). 
                    Soules College of Business, University of Texas at Tyler.
                </div>
            </div>
            
            <div class="copyright">
                <p>© ${new Date().getFullYear()} University of Texas at Tyler</p>
                <p>All rights reserved</p>
            </div>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Generate summary items for executive summary (no longer used in new format)
     */
    generateSummaryItems() {
        return '';
    }

    /**
     * Generate US indicators section (no longer used in new format)
     */
    generateUSIndicators() {
        return '';
    }

    /**
     * Generate regional indicators section (no longer used in new format)
     */
    generateRegionalIndicators() {
        return '';
    }

    /**
     * Generate detailed data tables (no longer used in new format)
     */
    generateDetailedTables() {
        return '';
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
