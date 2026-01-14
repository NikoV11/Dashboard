# THE HIBBS MONITOR - HTML/CSS Template Reference
## Ready-to-Use Code Snippets for Replication

---

## COMPLETE HTML TEMPLATE

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THE HIBBS MONITOR - November 2025</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @media print {
            body { margin: 0; padding: 0; }
            .page { page-break-after: always; }
            .page:last-child { page-break-after: avoid; }
        }

        body {
            font-family: 'Cambria', 'Georgia', serif;
            color: #000000;
            background-color: #f5f5f5;
            line-height: 1.4;
            margin: 20px;
        }

        .page {
            width: 8.5in;
            height: 11in;
            background: white;
            margin: 20px auto;
            padding: 0.56in;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
        }

        /* PAGE 1: COVER PAGE */
        .page-cover {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            gap: 20px;
        }

        .cover-date {
            font-family: 'Open Sans', sans-serif;
            font-size: 21.3pt;
            font-weight: 300;
            color: #000000;
        }

        .cover-title {
            font-family: 'Open Sans', sans-serif;
            font-size: 25.8pt;
            font-weight: 700;
            color: #000000;
            margin: 10px 0;
        }

        .cover-main {
            font-family: 'Rubik', sans-serif;
            font-size: 68.6pt;
            font-weight: 600;
            color: #000000;
            margin: 20px 0;
            line-height: 1;
        }

        .cover-subtitle {
            font-family: 'Open Sans', sans-serif;
            font-size: 25.8pt;
            font-weight: 700;
            color: #000000;
            margin-top: 30px;
        }

        .cover-logo {
            width: 150px;
            height: auto;
            margin: 20px 0;
        }

        /* PAGES 2-3: CONTENT PAGES */
        .page-content {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        .section-header {
            font-family: 'Open Sans', sans-serif;
            font-size: 13.3pt;
            font-weight: 700;
            color: #000000;
            text-transform: uppercase;
            margin-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }

        .subsection-header {
            font-family: 'Open Sans', sans-serif;
            font-size: 12.3pt;
            font-weight: 700;
            color: #000000;
            margin: 15px 0 10px 0;
        }

        /* METRIC CARDS & INDICATORS */
        .metric-section {
            margin: 15px 0;
        }

        .metric-title {
            font-size: 11pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 10px;
        }

        .metric-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }

        .kpi-card {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 15px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .kpi-value {
            font-family: 'Cambria', serif;
            font-size: 14pt;
            font-weight: bold;
            color: #000000;
            margin-bottom: 8px;
        }

        .kpi-label {
            font-family: 'Open Sans', sans-serif;
            font-size: 10pt;
            font-weight: 600;
            color: #333333;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .kpi-date {
            font-family: 'Cambria', serif;
            font-size: 8pt;
            color: #666666;
        }

        /* CHARTS & IMAGES */
        .chart-container {
            margin: 15px 0;
            text-align: center;
        }

        .chart-title {
            font-family: 'Open Sans', sans-serif;
            font-size: 11pt;
            font-weight: bold;
            color: #000000;
            margin-bottom: 10px;
        }

        .chart-image {
            max-width: 100%;
            height: auto;
            border-radius: 2px;
        }

        /* TEXT BLOCKS */
        .metric-description {
            font-family: 'Cambria', serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333333;
            margin: 10px 0;
        }

        .metric-notes {
            font-family: 'Cambria', serif;
            font-size: 7pt;
            font-style: italic;
            color: #666666;
            margin: 8px 0;
        }

        .metric-source {
            font-family: 'Cambria', serif;
            font-size: 7pt;
            color: #666666;
            margin: 5px 0 15px 0;
        }

        /* REGIONAL DATA LAYOUT */
        .regional-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
        }

        .regional-column {
            padding: 10px;
        }

        .tax-category {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .tax-category-name {
            font-family: 'Cambria', serif;
            font-size: 11pt;
            color: #333333;
        }

        .tax-category-value {
            font-family: 'Cambria', serif;
            font-size: 11pt;
            font-weight: bold;
            color: #000000;
        }

        /* PAGE 4: STAFF PAGE */
        .page-staff {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .staff-section-title {
            font-family: 'Open Sans', sans-serif;
            font-size: 16pt;
            font-weight: 700;
            color: #000000;
            text-align: center;
            margin-bottom: 20px;
        }

        .staff-position-title {
            font-family: 'Open Sans', sans-serif;
            font-size: 11pt;
            font-weight: 700;
            color: #333333;
            margin-top: 15px;
            margin-bottom: 5px;
        }

        .staff-name {
            font-family: 'Cambria', serif;
            font-size: 11pt;
            color: #000000;
            margin-bottom: 10px;
        }

        .contact-info {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }

        .contact-item {
            font-family: 'Cambria', serif;
            font-size: 10pt;
            line-height: 1.8;
            color: #333333;
        }

        .contact-label {
            font-weight: bold;
            color: #000000;
        }

        .citation {
            font-family: 'Cambria', serif;
            font-size: 8pt;
            color: #666666;
            line-height: 1.5;
            margin-top: 20px;
            text-align: left;
        }

        /* UTILITY CLASSES */
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .mt-20 { margin-top: 20px; }
        .mb-20 { margin-bottom: 20px; }
        .mt-10 { margin-top: 10px; }
        .mb-10 { margin-bottom: 10px; }
    </style>
</head>
<body>
    <!-- PAGE 1: COVER -->
    <div class="page page-cover">
        <div class="cover-logo">
            <!-- Logo image here -->
        </div>
        <div class="cover-date">November 2025</div>
        <div class="cover-title">THE HIBBS</div>
        <div class="cover-main">MONITOR</div>
        <div class="cover-subtitle">TRACKING THE ECONOMY</div>
        <div class="cover-logo">
            <!-- Footer logo image here -->
        </div>
    </div>

    <!-- PAGE 2: NATIONAL INDICATORS -->
    <div class="page page-content">
        <div class="section-header">THE U.S.</div>

        <!-- REAL GDP SECTION -->
        <div class="metric-section">
            <div class="subsection-header">Real GDP: Percentage change from preceding quarter</div>
            <div class="chart-container">
                <img src="gdp-chart.png" alt="Real GDP Chart" class="chart-image">
            </div>
            <div class="metric-description">
                The Atlanta FED estimates that the real gross domestic product (GDP) increased at an annual rate of 4.0% during the third quarter of 2025.
            </div>
            <div class="metric-notes">Notes: the figures are seasonally adjusted. As of November 25, 2025.</div>
            <div class="metric-source">Source: The Federal Reserve Bank of Atlanta</div>
        </div>

        <!-- CPI-U SECTION -->
        <div class="metric-section">
            <div class="subsection-header">One-month percent change in CPI All Urban Consumers (CPI-U)</div>
            <div class="chart-container">
                <img src="cpi-chart.png" alt="CPI-U Chart" class="chart-image">
            </div>
            <div class="metric-description">
                The Consumer Price Index for All Urban Consumers (CPI-U) rose by 0.3% in September 2025 following a 0.4% rise in August and 0.2% rise in July
            </div>
            <div class="metric-notes">Notes: the figures are seasonally adjusted.</div>
            <div class="metric-source">Source: U.S. Bureau of Labor Statistics.</div>
        </div>

        <!-- KEY INDICATORS -->
        <div class="metric-group">
            <div class="kpi-card">
                <div class="kpi-value">4.4%</div>
                <div class="kpi-label">Unemployment Rate</div>
                <div class="kpi-date">(September 2025)</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">+119,000</div>
                <div class="kpi-label">Jobs</div>
                <div class="kpi-date">(September 2025)</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">3.75 - 4.0%</div>
                <div class="kpi-label">Federal Funds Rate</div>
                <div class="kpi-date">FOMC as of Oct 29, 2025</div>
            </div>
        </div>
    </div>

    <!-- PAGE 3: REGIONAL INDICATORS -->
    <div class="page page-content">
        <div class="section-header">REGIONAL:</div>
        <div class="subsection-header">TEXAS & TYLER,MSA</div>

        <!-- TAX COLLECTIONS -->
        <div class="metric-section">
            <div class="metric-title">Tax Collections (October 2025)</div>
            <div class="regional-grid">
                <div class="regional-column">
                    <div class="tax-category">
                        <span class="tax-category-name">Utility Taxes</span>
                        <span class="tax-category-value">2.6%</span>
                    </div>
                    <div class="tax-category">
                        <span class="tax-category-name">Natural Gas Production</span>
                        <span class="tax-category-value">3.5%</span>
                    </div>
                </div>
                <div class="regional-column">
                    <div class kpi-card">
                        <div class="kpi-value">$6.4B</div>
                        <div class="kpi-label">Total Tax Collections</div>
                    </div>
                </div>
            </div>
            <div class="metric-description">
                In October 2025, the sales tax revenue in Texas was $4.19 billion, representing a 5.7% increase from the previous month.
            </div>
        </div>

        <!-- EMPLOYMENT GROWTH -->
        <div class="metric-section">
            <div class="subsection-header">Employment Growth - Annualized percentage change</div>
            <div class="chart-container">
                <img src="employment-chart.png" alt="Employment Growth Chart" class="chart-image">
            </div>
            <div class="metric-description">
                In August 2025, Texas employment rose by 3.2% and Tyler MSA employment decreased by 2.1%
            </div>
            <div class="metric-group">
                <div class="kpi-card">
                    <div class="kpi-value">+179,898</div>
                    <div class="kpi-label">Jobs YoY</div>
                    <div class="kpi-date">Texas (August 2025)</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">+2,710</div>
                    <div class="kpi-label">Jobs YoY</div>
                    <div class="kpi-date">Tyler MSA (August 2025)</div>
                </div>
            </div>
            <div class="metric-source">Source: The Federal Reserve Bank of Dallas.</div>
        </div>

        <!-- MORTGAGE RATES -->
        <div class="metric-section">
            <div class="metric-group">
                <div class="kpi-card">
                    <div class="kpi-value">6.26%</div>
                    <div class="kpi-label">30-Year FRM</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">5.54%</div>
                    <div class="kpi-label">15-Year FRM</div>
                </div>
            </div>
            <div class="metric-notes">Notes: U.S. weekly averages as of 11/20/2025</div>
            <div class="metric-source">Source: Freddie Mac.</div>
        </div>
    </div>

    <!-- PAGE 4: STAFF INFORMATION -->
    <div class="page page-staff">
        <div class="staff-section-title">HIBBS INSTITUTE STAFF</div>

        <div>
            <div class="staff-position-title">Director and Senior Research Analyst</div>
            <div class="staff-name">Manuel Reyes, D.E.D.</div>
        </div>

        <div>
            <div class="staff-position-title">Junior Research Analyst</div>
            <div class="staff-name">Cecilia Cuellar, Ph.D.</div>
        </div>

        <div>
            <div class="staff-position-title">Hibbs Faculty Research Fellow</div>
            <div class="staff-name">Marilyn Young, Ph.D.</div>
        </div>

        <div>
            <div class="staff-position-title">Research Assistants</div>
            <div class="staff-name">
                Pedro Gallardo-Toledo<br>
                Sara Maldonado<br>
                Luisa Moraes<br>
                Nikolaos Vasileiou
            </div>
        </div>

        <div class="contact-info">
            <div class="contact-item"><span class="contact-label">For more information, visit:</span><br>uttyler.edu/hibbs-institute</div>
            <div class="contact-item"><span class="contact-label">Email us at:</span><br>HibbsInstitute@uttyler.edu</div>
            <div class="contact-item"><span class="contact-label">Call:</span><br>903.565.5952</div>
        </div>

        <div class="citation">
            <strong>Suggested citation:</strong><br>
            Hibbs Institute for Business and Economic Research (November, 2025). The Hibbs Monitor (Report No. 25-NOV-HM). Soules College of Business. University of Texas at Tyler.
        </div>
    </div>
</body>
</html>
```

---

## PRINT STYLES FOR PDF EXPORT

```css
@media print {
    @page {
        size: letter;
        margin: 0;
    }

    body {
        margin: 0;
        padding: 0;
        background: white;
    }

    .page {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0.56in;
        box-shadow: none;
        page-break-after: always;
        page-break-inside: avoid;
    }

    .page:last-child {
        page-break-after: avoid;
    }

    /* Prevent breaks within sections */
    .metric-section,
    .kpi-card,
    .staff-position-title + .staff-name {
        page-break-inside: avoid;
    }

    /* Hide on print if needed */
    /* .no-print { display: none; } */
}
```

---

## KEY DIMENSIONS & SPACING (PIXELS TO INCHES)

```
Page Dimensions:
- Width: 612px = 8.5 inches (at 72 DPI)
- Height: 792px = 11 inches (at 72 DPI)

Margins:
- All sides: 40px = 0.556 inches (≈ 0.5" for practical purposes)

Text Spacing:
- Between sections: 25px = 0.35 inches
- Between subsections: 15px = 0.21 inches
- Between lines: 1.4 line-height

Font Sizes (convert pt to px):
- 68.6pt = ~91px
- 25.8pt = ~34px
- 21.3pt = ~28px
- 13.3pt = ~18px
- 12pt = ~16px
- 11pt = ~15px
- 10pt = ~13px
- 8pt = ~11px
- 7pt = ~9px
- 6pt = ~8px

(Conversion: px ≈ pt × 96/72 ÷ 0.75)
```

---

## PRINT-TO-PDF INSTRUCTIONS

### **For Chrome/Chromium Browsers:**
1. Press `Ctrl + P` (Windows) or `Cmd + P` (Mac)
2. Set options:
   - Destination: "Save as PDF"
   - Paper size: "Letter" (8.5" × 11")
   - Margins: "Custom" → 0.5" all sides
   - Scale: 100% (or as needed)
3. Click "Save"

### **For JavaScript (Programmatic):**
```javascript
window.print();
// Then in Chrome dev tools or electron:
// Use --print-to-pdf or similar flags
```

### **For Libraries (Node.js/Python):**
```javascript
// Puppeteer example
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('file:///path/to/hibbs-monitor.html');
await page.pdf({
    path: 'hibbs-monitor.pdf',
    format: 'letter',
    margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
    }
});
```

---

## RESPONSIVE ADJUSTMENTS FOR SCREEN VIEWING

```css
@media (max-width: 1024px) {
    .page {
        width: 90vw;
        height: auto;
        margin: 10px auto;
    }

    .metric-group {
        grid-template-columns: 1fr;
    }

    .regional-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    body { font-size: 10pt; }
    .cover-main { font-size: 48pt; }
    .section-header { font-size: 11pt; }
}
```

---

## FONT LOADING ALTERNATIVES

### **If Google Fonts not available:**

```css
@font-face {
    font-family: 'OpenSans';
    src: url('fonts/OpenSans-Light.woff2') format('woff2'),
         url('fonts/OpenSans-Light.woff') format('woff');
    font-weight: 300;
}

@font-face {
    font-family: 'OpenSans';
    src: url('fonts/OpenSans-Bold.woff2') format('woff2'),
         url('fonts/OpenSans-Bold.woff') format('woff');
    font-weight: 700;
}

@font-face {
    font-family: 'Rubik';
    src: url('fonts/Rubik-SemiBold.woff2') format('woff2'),
         url('fonts/Rubik-SemiBold.woff') format('woff');
    font-weight: 600;
}
```

### **System Font Fallback:**

```css
font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
font-family: 'Cambria', 'Georgia', 'Times New Roman', serif;
```

---

## DATA-DRIVEN TEMPLATE

```html
<!-- Example for dynamic data -->
<div class="metric-group">
    <div class="kpi-card" data-metric="unemployment">
        <div class="kpi-value" data-value="4.4">4.4%</div>
        <div class="kpi-label">Unemployment Rate</div>
        <div class="kpi-date">(September 2025)</div>
    </div>
</div>

<script>
// JavaScript to populate from API/data source
const metrics = {
    unemployment: { value: 4.4, label: 'Unemployment Rate', date: 'September 2025' },
    jobs: { value: '+119,000', label: 'Jobs', date: 'September 2025' }
};

Object.keys(metrics).forEach(key => {
    const card = document.querySelector(`[data-metric="${key}"]`);
    if (card) {
        card.querySelector('[data-value]').textContent = metrics[key].value;
        // Update other fields as needed
    }
});
</script>
```

---

**Template Version:** 1.0
**Last Updated:** January 2026
**Compatibility:** Chrome, Firefox, Safari, Edge, Modern Browsers
**Print Quality:** 300+ DPI equivalent when exported to PDF

