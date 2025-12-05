# Real GDP & CPI-U Interactive Dashboard

A responsive, interactive dashboard displaying Real GDP quarterly percentage changes and CPI-U monthly percent changes with interactive bar charts.

## Features

- **Real GDP Chart**: Quarterly percentage change from the preceding quarter (Series: GDPC1)
- **CPI-U Chart**: One-month percent change in Consumer Price Index for All Urban Consumers (Series: CPIAUCSL)
- **Interactive Controls**: Filter data by year range
- **Data Table**: Detailed view of all data points
- **Data Export**: Download filtered data as CSV
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Custom Color Scheme**: 
  - GDP bars: #CB6015 (orange)
  - CPI bars: #002F6C (dark blue)

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Use the year range controls to filter data
4. Click "Update Charts" to refresh visualizations
5. Click "Download Data" to export filtered data as CSV

## File Structure

```
dashboard/
├── index.html       # Main HTML file
├── styles.css       # CSS styling (responsive design)
├── dashboard.js     # JavaScript logic (charts, interactivity, data handling)
└── README.md        # This file
```

## Technologies Used

- **Chart.js** 4.4.0: Interactive bar charts
- **HTML5**: Semantic markup
- **CSS3**: Responsive grid layout, gradients, animations
- **Vanilla JavaScript**: No frameworks - lightweight and fast

## Data

Currently uses sample data. To integrate with real FRED data:

1. Get a free API key from [Federal Reserve Economic Data (FRED)](https://fred.stlouisfed.org/docs/api/)
2. Modify `sampleData` in `dashboard.js` to fetch from FRED API
3. Update the `getFilteredData()` function to handle real API responses

Example FRED API integration:
```javascript
const gdpcUrl = `https://api.stlouisfed.org/fred/series/data?series_id=GDPC1&api_key=YOUR_API_KEY&file_type=json`;
const cpiUrl = `https://api.stlouisfed.org/fred/series/data?series_id=CPIAUCSL&api_key=YOUR_API_KEY&file_type=json`;
```

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --gdp-color: #CB6015;  /* GDP bar color */
    --cpi-color: #002F6C;  /* CPI bar color */
}
```

### Data Update Frequency
Modify the `sampleData` object in `dashboard.js` or implement live API polling.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lightweight (~15KB uncompressed)
- No external dependencies besides Chart.js
- Responsive animations and interactions
- Optimized for performance on mobile devices

## License

MIT License - Feel free to use and modify for your needs.

## Contributing

To suggest improvements or report issues, please create an issue or pull request.

## Data Sources

- **Real GDP (GDPC1)**: U.S. Real Gross Domestic Product - Federal Reserve Economic Data (FRED)
- **CPI-U (CPIAUCSL)**: Consumer Price Index for All Urban Consumers - Federal Reserve Economic Data (FRED)

---

**Last Updated**: December 2025
