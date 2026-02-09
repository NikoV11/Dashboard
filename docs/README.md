# FRED Economic Dashboard

An interactive, real-time economic dashboard tracking national and regional economic indicators for Tyler MSA and the United States. Built by the UT Tyler Hibbs Institute for Business and Economic Research.

## Quick Start

1. **View the Dashboard**
   ```bash
   # Open in browser
   start public/index.html
   ```

2. **Run the Server** (for Excel data import)
   ```bash
   npm install
   npm start
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

## Features

### US Economy
- Real GDP: Quarterly percentage change
- Inflation (CPI-U): Monthly percent change

### Labor Market
- National unemployment rate
- Texas unemployment rate
- Tyler MSA unemployment rate
- Nonfarm employment trends
- Regional employment data

### Housing Market
- Median home prices
- 30-year and 15-year mortgage rates

### Public Finances
- Texas sales tax collections
- State revenue tracking

## Project Structure

```
Dashboard/
│
├── public/                     # Production-ready static files
│   ├── index.html             # Main entry point
│   ├── styles.css             # Compiled styles
│   ├── favicon.svg            # Browser icon
│   ├── images/                # Image assets
│   │   └── favicon.svg
│   └── js/                    # Bundled JavaScript
│       └── (compiled files)
│
├── src/                        # Source code
│   ├── js/
│   │   └── dashboard.js        # Main application logic
│   └── css/
│       └── styles.css          # Application styles
│
├── data/                       # Data files and definitions
│   ├── raw/
│   │   └── dashboard-data.csv  # Raw CSV data
│   └── definitions/
│       ├── employment-data.js
│       ├── mortgage-data.js
│       └── revenue-data.js
│
├── server/                     # Backend server code
│   └── server.js              # Express server for Excel upload
│
├── scripts/                    # Utility scripts
│   ├── compare-texas-revenue.mjs
│   └── upload-excel-to-r2.js
│
├── reports/                    # Generated reports
│   ├── texas-revenue-fred-compare.csv
│   └── texas-revenue-fred-compare.json
│
├── docs/                       # Documentation
│   ├── README.md              # Full documentation
│   ├── EXCEL_SETUP.md         # Excel integration guide
│   └── PROJECT_STRUCTURE.md   # Detailed structure guide
│
├── .github/                    # GitHub-specific files
│   └── copilot-instructions.md
│
├── package.json               # Project dependencies
├── .env.example               # Environment variable template
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## Technologies

- **Frontend**: Chart.js 4.4.0, HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Data**: FRED API, Excel files, CSV imports
- **Deployment**: Cloudflare Workers (optional)

## Documentation

- [Full Documentation](docs/README.md) - Complete feature and architecture guide
- [Project Structure Guide](docs/PROJECT_STRUCTURE.md) - Detailed directory organization
- [Excel Setup Guide](docs/EXCEL_SETUP.md) - Excel data integration instructions

## Data Sources

- **Federal Reserve Economic Data (FRED)** - FRED API
- **Freddie Mac** - Mortgage rates
- **Texas Comptroller** - State revenue data
- **U.S. Bureau of Labor Statistics** - Employment data

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Installation
```bash
npm install
```

### Commands
```bash
npm start      # Start development server
npm run dev    # Watch mode development
npm run build  # Build project (static site)
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

## Contributing

1. Create a feature branch
2. Make changes in `src/` directory
3. Test in `public/` directory
4. Update documentation in `docs/`
5. Submit pull request

## Organization Standards

This project follows professional directory standards:
- **src/** - Source code only
- **public/** - Production-ready files
- **data/** - Data files, organized by type
- **docs/** - All documentation
- **scripts/** - Utility and build scripts
- **server/** - Backend code
- **reports/** - Generated output

## Support

For issues or questions, contact the UT Tyler Hibbs Institute for Business and Economic Research.

---

**FRED Economic Dashboard**  
UT Tyler Hibbs Institute for Business and Economic Research  
Last Updated: February 2026
