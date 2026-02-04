# Hibbs Monitor - East Texas & US Economic Dashboard

An interactive, real-time economic dashboard tracking national and regional economic indicators for Tyler MSA and the United States. Built by the UT Tyler Hibbs Institute for Business and Economic Research.

## Features

**US Economy**
- Real GDP: Quarterly percentage change (FRED: A191RL1Q225SBEA)
- Inflation (CPI-U): Monthly percent change (FRED: CPIAUCSL)

**Labor Market**
- Unemployment Rate: National unemployment trends (FRED: UNRATE)
- Texas Unemployment Rate (FRED: TXUR)
- Tyler, TX Unemployment Rate (FRED: TYLE348UR)
- Total Nonfarm Employment: Monthly employment change (FRED: PAYEMS)
- Tyler MSA Employment (FRED: TYLSA158MFRBDAL)
- Texas Employment (FRED: TX0000000M175FRBDAL)
- Regional Employment: Tyler MSA employment data (BLS)

**Housing Market**
- Median Home Price: Month-over-month percentage change (FRED: MEDLISPRIMM46340)
- Mortgage Rates: 30-year and 15-year fixed rates (FRED: MORTGAGE30US, MORTGAGE15US)

**Public Finances**
- Sales Tax: Tyler MSA sales tax collections (Texas Comptroller)
- State Revenue: Texas tax collections and distributions (Texas Comptroller)

## Data Sources

- **Board of Governors of the Federal Reserve System** - Federal Reserve Economic Data (FRED) — A191RL1Q225SBEA, CPIAUCSL, UNRATE, TXUR, TYLE348UR, PAYEMS, MEDLISPRIMM46340, TYLSA158MFRBDAL, TX0000000M175FRBDAL, MORTGAGE30US, MORTGAGE15US
- **Freddie Mac** - Primary Mortgage Market Survey
- **State Comptroller of Public Accounts, State of Texas** - Tax Collections
- **U.S. Bureau of Labor Statistics** - Employment Data

## Quick Start

1. Open `index.html` in a modern web browser
2. Use the date range controls to select data period
3. Click "Update" to refresh all charts
4. View detailed data in each section
5. Download data as CSV using the "Download CSV" buttons
6. View the latest FOMC statement link in the hero section

## Technologies

- **Chart.js 4.4.0** - Interactive charting
- **HTML5** - Semantic markup with accessibility
- **CSS3** - Responsive design with mobile optimization
- **Vanilla JavaScript** - No frameworks required

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
Dashboard/
├── index.html              # Main HTML file
├── styles.css              # Responsive styling (1404 lines)
├── dashboard.js            # Core application logic (2600+ lines)
├── employment-data.js      # Employment data
├── revenue-data.js         # Revenue data
├── report-generator.js     # Monthly report generation
├── images/                 # Logo and assets
└── README.md               # This file
```

## Mobile Optimization

- Touch-optimized controls (48-52px targets)
- Safe area support for notched devices
- Responsive breakpoints: 480px, 640px, 900px, 1280px+
- WCAG 2.1 AA accessibility compliance
- Optimized typography and spacing

## Customization

Colors are defined in `styles.css`:
```css
:root {
    --gdp: #CB6015;        /* GDP charts */
    --cpi: #002F6C;        /* CPI charts */
}
```

---

**Hibbs Monitor** - East Texas & US Economic Dashboard  
UT Tyler Hibbs Institute for Business and Economic Research  
Last Updated: January 2026
