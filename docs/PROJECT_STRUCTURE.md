# Project Structure

The Dashboard project follows a professional, organized folder structure for maintainability and scalability.

## Directory Layout

```
Dashboard/
├── src/                          # Source code
│   ├── js/
│   │   └── dashboard.js         # Main application logic
│   └── css/
│       └── styles.css           # Application styles
│
├── data/                         # Data files
│   ├── employment-data.js        # Employment data definitions
│   ├── mortgage-data.js          # Mortgage rate data definitions
│   └── revenue-data.js           # Revenue data definitions
│
├── public/                       # Public-facing files
│   ├── index.html               # Main HTML entry point
│   └── images/                  # Image assets
│       └── utt_rgb_Level_1C_Hibbs_stacked-fullcolor (1).png
│
├── docs/                         # Documentation
│   └── README.md                # Project README
│
├── reports/                      # Generated reports
│   ├── texas-revenue-fred-compare.csv
│   ├── texas-revenue-fred-compare.json
│   └── compare-texas-revenue.mjs
│
├── scripts/                      # Utility scripts
│   └── (development scripts)
│
├── package.json                  # Project dependencies
├── .gitignore                    # Git ignore rules
└── PROJECT_STRUCTURE.md          # This file
```

## File Organization

### `src/js/dashboard.js`
- Main application file
- Contains all Chart.js visualizations
- Handles data fetching from FRED API
- Manages UI interactions
- Exports CSV functionality

### `src/css/styles.css`
- Responsive design styles
- Custom color scheme (GDP: #CB6015, CPI: #002F6C)
- Mobile-optimized layout
- Dark mode support

### `data/*.js`
- Static data definitions for employment, mortgage, and revenue
- Can be extended with API integration
- Loaded before dashboard.js

### `public/index.html`
- HTML structure and layout
- Chart containers
- Control elements
- Link to resources

## How to Run

1. Open `public/index.html` in a web browser
2. The application loads with default data (2015-2025)
3. Use controls to filter by year range
4. Charts update automatically with selected data
5. Export data using "Download CSV" button

## Integration with Version Control

All source files are tracked in git. The folder structure is committed to:
- **Branch:** `fred-revenue-api` (development)
- **Main:** Stable production version
- **Commits:** Organized by feature/refactor

## File Path References

HTML file references are relative to `public/index.html`:
- CSS: `../src/css/styles.css`
- Data files: `../data/employment-data.js`, `../data/revenue-data.js`
- JavaScript: `../src/js/dashboard.js`
- Images: `../images/`

## Next Steps

- [ ] Add live API integration (FRED endpoints)
- [ ] Expand data source coverage
- [ ] Implement additional chart types
- [ ] Add export to additional formats (PDF, Excel)
- [ ] Enhance mobile experience
