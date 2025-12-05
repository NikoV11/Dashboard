<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Dashboard Project Setup Checklist

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements - Interactive dashboard with Real GDP and CPI data visualization using bar charts with custom colors (#CB6015 and #002F6C)
- [x] Scaffold the Project - Created standalone HTML/CSS/JavaScript dashboard (no build tools required)
- [x] Customize the Project - Implemented interactive charts, data filtering, CSV export, responsive design
- [x] Install Required Extensions - No extensions needed for this project
- [x] Compile the Project - No compilation required; runs directly in browser
- [x] Create and Run Task - Static file project; open index.html in browser
- [x] Launch the Project - Ready to use
- [x] Ensure Documentation is Complete - README.md and this file created

## Project Overview

**Real GDP & CPI-U Interactive Dashboard**

A responsive, browser-based dashboard displaying:
- Real GDP quarterly percentage changes (GDPC1)
- CPI-U monthly percent changes (CPIAUCSL)
- Interactive bar charts with custom colors
- Year-range filtering
- CSV data export
- Data preview table

## Quick Start

1. Open `index.html` in any modern web browser
2. Use year range inputs to filter data (default: 2015-2025)
3. Click "Update Charts" to refresh visualizations
4. Click "Download Data" to export as CSV

## File Structure

- `index.html` - Main dashboard UI with controls and chart containers
- `styles.css` - Responsive design, color scheme (#CB6015 GDP, #002F6C CPI)
- `dashboard.js` - Chart.js integration, data filtering, interactivity
- `README.md` - Full documentation and integration guide

## Technologies

- Chart.js 4.4.0 for interactive bar charts
- HTML5 + CSS3 + Vanilla JavaScript
- No build tools, no server required
- Fully responsive (desktop, tablet, mobile)

## Next Steps (Optional)

To integrate live FRED data:
1. Get free API key from https://fred.stlouisfed.org/docs/api/
2. Replace `sampleData` in `dashboard.js` with API calls
3. Add FRED API endpoints for GDPC1 and CPIAUCSL series

## Customization

Colors are defined in `styles.css`:
- GDP: #CB6015 (burnt orange)
- CPI: #002F6C (navy blue)

Modify the CSS variables in `:root` to change colors throughout the dashboard.
