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
        
        body {
            font-family: 'Calibri', 'Georgia', 'Times New Roman', serif;
            line-height: 1.4;
            color: #000;
            background: #f5f5f5;
        }
        
        .page {
            width: 8.5in;
            height: 11in;
            margin: 20px auto;
            padding: 0;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            page-break-after: always;
        }
        
        .page-container {
            width: 100%;
            height: 100%;
            padding: 0.5in;
            display: flex;
            flex-direction: column;
        }
        
        /* Cover Page */
        .cover-page .page-container {
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }
        
        .cover-title {
            text-align: center;
        }
        
        .cover-title .month-year {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            font-weight: 500;
        }
        
        .cover-title h1 {
            font-size: 56px;
            font-weight: 700;
            color: #000;
            letter-spacing: 3px;
            margin: 0;
            line-height: 1.2;
        }
        
        .cover-title .subtitle {
            font-size: 18px;
            color: #666;
            margin-top: 20px;
            letter-spacing: 2px;
            font-weight: 500;
        }
        
        .cover-title .institution {
            font-size: 12px;
            color: #999;
            margin-top: 40px;
        }
        
        /* Data Pages */
        .header-text {
            font-size: 28pt;
            font-weight: 700;
            color: #000;
            margin-bottom: 20px;
            letter-spacing: 1px;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            flex: 1;
        }
        
        .metric-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 16px;
            display: flex;
            flex-direction: column;
        }
        
        .metric-title {
            font-size: 12px;
            font-weight: 600;
            color: #666;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .metric-subtitle {
            font-size: 11px;
            color: #999;
            margin-bottom: 12px;
            font-style: italic;
        }
        
        .metric-value {
            font-size: 36px;
            font-weight: 700;
            color: #CA5F15;
            margin: 12px 0;
        }
        
        .metric-period {
            font-size: 11px;
            color: #666;
            margin-top: 8px;
        }
        
        .metric-narrative {
            font-size: 11px;
            line-height: 1.5;
            color: #333;
            margin-top: 10px;
        }
        
        .metric-source {
            font-size: 9px;
            color: #999;
            margin-top: 8px;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
        }
        
        .single-column {
            grid-column: 1 / -1;
        }
        
        .footer-notes {
            font-size: 9px;
            color: #666;
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            line-height: 1.4;
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
        }
        
        .print-button:hover {
            background: #a34c0f;
        }
        
        @media print {
            body { background: white; }
            .print-button { display: none; }
            .page { margin: 0; box-shadow: none; }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
    
    <!-- Cover Page -->
    <div class="page cover-page">
        <div class="page-container">
            <div class="cover-title">
                <div class="month-year">${monthName} ${this.reportYear}</div>
                <h1>THE HIBBS<br>MONITOR</h1>
                <div class="subtitle">TRACKING THE ECONOMY</div>
                <div class="institution">
                    <p>Hibbs Institute for Business and Economic Research</p>
                    <p>Soules College of Business</p>
                    <p>University of Texas at Tyler</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- US Economic Indicators Page -->
    <div class="page">
        <div class="page-container">
            <div class="header-text">THE U.S.</div>
            
            <div class="content-grid">
                <!-- Real GDP -->
                <div class="metric-box">
                    <div class="metric-title">Real GDP</div>
                    <div class="metric-subtitle">Percentage change from preceding quarter</div>
                    <div class="metric-value">${this.reportData.gdp?.latest?.toFixed(2) || 'N/A'}%</div>
                    <div class="metric-narrative">
                        ${this.reportData.gdp?.latest ? `Real gross domestic product increased at an annual rate of ${this.reportData.gdp.latest.toFixed(2)}% in the latest quarter.` : 'Data not available'}
                    </div>
                    <div class="metric-source">
                        Notes: Figures are seasonally adjusted. As of ${dateStr}<br>
                        Source: Federal Reserve Economic Data (FRED) - Series A191RL1Q225SBEA
                    </div>
                </div>
                
                <!-- CPI-U -->
                <div class="metric-box">
                    <div class="metric-title">CPI-U</div>
                    <div class="metric-subtitle">One-month percent change</div>
                    <div class="metric-value">${this.reportData.cpi?.latest?.toFixed(2) || 'N/A'}%</div>
                    <div class="metric-narrative">
                        ${this.reportData.cpi?.latest ? `Consumer Price Index for All Urban Consumers rose ${this.reportData.cpi.latest > 0 ? 'by' : ''} ${this.reportData.cpi.latest.toFixed(2)}% in the latest month.` : 'Data not available'}
                    </div>
                    <div class="metric-source">
                        Notes: Figures are seasonally adjusted. As of ${dateStr}<br>
                        Source: Federal Reserve Economic Data (FRED) - Series CPIAUCSL
                    </div>
                </div>
                
                <!-- Unemployment Rate -->
                <div class="metric-box">
                    <div class="metric-title">Unemployment Rate</div>
                    <div class="metric-value">${this.reportData.unemployment?.latest?.toFixed(1) || 'N/A'}%</div>
                    <div class="metric-period">Latest month</div>
                    <div class="metric-source">
                        Source: Federal Reserve Economic Data (FRED) - Series UNRATE
                    </div>
                </div>
                
                <!-- Federal Funds Rate -->
                <div class="metric-box">
                    <div class="metric-title">Federal Funds Rate</div>
                    <div class="metric-subtitle">Current target range</div>
                    <div class="metric-value">3.75% - 4.0%</div>
                    <div class="metric-source">
                        Source: Federal Reserve
                    </div>
                </div>
                
                <!-- Mortgage Rates -->
                <div class="metric-box">
                    <div class="metric-title">Mortgage Rates</div>
                    <div class="metric-subtitle">Primary Mortgage Market Survey</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: #CA5F15;">${this.reportData.mortgage?.latest30?.toFixed(2) || 'N/A'}%</div>
                            <div style="font-size: 10px; color: #666;">30-Year Fixed</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: #003065;">${this.reportData.mortgage?.latest15?.toFixed(2) || 'N/A'}%</div>
                            <div style="font-size: 10px; color: #666;">15-Year Fixed</div>
                        </div>
                    </div>
                    <div class="metric-source" style="margin-top: 12px;">
                        Source: Freddie Mac Primary Mortgage Market Survey
                    </div>
                </div>
            </div>
            
            <div class="footer-notes">
                <strong>Data Sources:</strong> Federal Reserve Economic Data (FRED), U.S. Bureau of Labor Statistics, Freddie Mac<br>
                <strong>Report Date:</strong> ${dateStr}
            </div>
        </div>
    </div>
    
    <!-- Regional Indicators Page -->
    <div class="page">
        <div class="page-container">
            <div class="header-text">REGIONAL (TYLER MSA)</div>
            
            <div class="content-grid">
                <!-- Employment -->
                <div class="metric-box">
                    <div class="metric-title">Employment Growth</div>
                    <div class="metric-subtitle">Month-over-month % change</div>
                    ${this.reportData.employment?.datasets ? `
                        <table style="width: 100%; margin-top: 10px; font-size: 11px;">
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 8px 0; font-weight: 600;">Region</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">Latest %</td>
                            </tr>
                            ${this.reportData.employment.datasets.map(ds => {
                                const latest = ds.data[ds.data.length - 1];
                                return `<tr style="border-bottom: 1px solid #f0f0f0;">
                                    <td style="padding: 6px 0;">${ds.label}</td>
                                    <td style="padding: 6px 0; text-align: right;">${latest?.toFixed(2) || 'N/A'}%</td>
                                </tr>`;
                            }).join('')}
                        </table>
                    ` : '<div style="color: #999; font-size: 11px; margin-top: 10px;">Data not available</div>'}
                    <div class="metric-source">
                        Source: Bureau of Labor Statistics
                    </div>
                </div>
                
                <!-- Sales Tax -->
                <div class="metric-box">
                    <div class="metric-title">Sales Tax Collections</div>
                    <div class="metric-subtitle">Tyler MSA aggregate</div>
                    <div class="metric-value">${this.reportData.salesTax?.latest?.toFixed(2) || 'N/A'}%</div>
                    <div class="metric-period">Month-over-month change</div>
                    <div class="metric-source">
                        Source: Texas Comptroller of Public Accounts
                    </div>
                </div>
                
                <!-- Median Home Price -->
                <div class="metric-box">
                    <div class="metric-title">Median Listing Price</div>
                    <div class="metric-subtitle">Month-over-month % change</div>
                    <div class="metric-value">${this.reportData.medianPrice?.latest?.toFixed(2) || 'N/A'}%</div>
                    <div class="metric-period">Latest month</div>
                    <div class="metric-source">
                        Source: Federal Reserve Economic Data (FRED) - Series MEDLISPRIMM46340
                    </div>
                </div>
                
                <!-- Tax Collections -->
                ${this.reportData.revenue ? `
                    <div class="metric-box single-column">
                        <div class="metric-title">Texas Tax Collections</div>
                        <div class="metric-subtitle">Top 5 categories by percentage</div>
                        ${(() => {
                            const top5 = this.reportData.revenue.labels
                                .map((label, i) => ({ label, value: this.reportData.revenue.values[i] }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 5);
                            return `
                                <table style="width: 100%; margin-top: 10px; font-size: 11px;">
                                    <tr style="border-bottom: 1px solid #e5e7eb;">
                                        <td style="padding: 8px 0; font-weight: 600;">Category</td>
                                        <td style="padding: 8px 0; text-align: right; font-weight: 600;">% of Total</td>
                                    </tr>
                                    ${top5.map(item => `<tr style="border-bottom: 1px solid #f0f0f0;">
                                        <td style="padding: 6px 0;">${item.label}</td>
                                        <td style="padding: 6px 0; text-align: right;">${((item.value / this.reportData.revenue.total) * 100).toFixed(1)}%</td>
                                    </tr>`).join('')}
                                </table>
                            `;
                        })()}
                        <div class="metric-source">
                            <strong>Total:</strong> $${(this.reportData.revenue.total / 1000000).toFixed(1)}M<br>
                            Source: Texas Comptroller of Public Accounts
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="footer-notes">
                <strong>Regional Note:</strong> Tyler MSA includes Tyler, Lindale, Whitehouse, Bullard, Troup, Noonday, Arp, Winona, and New Chapel Hill<br>
                <strong>Report Date:</strong> ${dateStr}
            </div>
        </div>
    </div>
    
    <!-- Back Page - Contact Info -->
    <div class="page">
        <div class="page-container" style="justify-content: center;">
            <div style="text-align: center;">
                <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 30px;">HIBBS INSTITUTE</h2>
                
                <div style="margin-bottom: 40px;">
                    <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">For More Information</h3>
                    <p style="font-size: 12px; margin: 4px 0;">
                        <strong>Website:</strong> www.uttyler.edu/hibbs-institute
                    </p>
                    <p style="font-size: 12px; margin: 4px 0;">
                        <strong>Email:</strong> HibbsInstitute@uttyler.edu
                    </p>
                    <p style="font-size: 12px; margin: 4px 0;">
                        <strong>Phone:</strong> 903.565.5952
                    </p>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                    <h3 style="font-size: 12px; font-weight: 600; margin-bottom: 12px;">Suggested Citation</h3>
                    <p style="font-size: 10px; line-height: 1.6; max-width: 5in; margin: 0 auto;">
                        Hibbs Institute for Business and Economic Research (${monthName}, ${this.reportYear}). 
                        The Hibbs Monitor (Report No. ${this.reportYear}-${String(this.reportMonth).padStart(2, '0')}-HM). 
                        Soules College of Business. University of Texas at Tyler.
                    </p>
                </div>
                
                <div style="margin-top: 40px; font-size: 9px; color: #999;">
                    <p>© ${new Date().getFullYear()} University of Texas at Tyler</p>
                    <p>All rights reserved</p>
                </div>
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
