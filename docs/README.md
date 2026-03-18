# FRED Economic Dashboard

An interactive, real-time economic dashboard tracking national and regional economic indicators for Tyler MSA and the United States. Built by the UT Tyler Hibbs Institute for Business and Economic Research.

**All data is sourced directly from official U.S. government APIs** - FRED, Census Bureau, and County Health Rankings.

## Setup

### 1. Install Dependencies
```bash
cd c:\Users\ps3zo\Desktop\Dashboard
npm install
```

### 2. Configure FRED API Key
Get a free API key from the Federal Reserve:
https://fred.stlouisfed.org/docs/api/

Create a `.env` file in the project root:
```
FRED_API_KEY=your_api_key_here
PORT=3000
```

### 3. Run the Server
```bash
npm start
# or
node server/server.js
```

The dashboard will be available at: **http://localhost:3000**

## Data Sources

**✅ All data is live and updated from official sources:**

- **FRED API** - Real GDP, CPI, unemployment rates, mortgage rates
- **Census Bureau ACS** - Demographics, education attainment, employment
- **County Health Rankings** - Health metrics for Texas counties

See [DATA_SOURCES.md](DATA_SOURCES.md) for complete details on all endpoints and update frequencies.

## Quick Start

1. **Set up FRED API key** (see Setup above)
2. **Run the server:**
   ```bash
   npm start
   ```
3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Features

### US Economy
- Real GDP: Live quarterly data from FRED
- Inflation (CPI-U): Live monthly data from FRED

### Labor Market
- National unemployment: Live from FRED
- Texas unemployment: Live from FRED
- Tyler MSA unemployment: Live from FRED
- Regional employment by industry: Census Bureau ACS
- Wages by industry: Census Bureau ACS

### Education & Demographics
- Educational attainment by race: **All 5 races from Census API**
  - White
  - Black
  - Hispanic
  - Asian
  - Other (combined)
- Age distribution: Census Bureau
- Race/ethnicity composition: Census Bureau

### Housing Market
- Median home prices: Live from FRED
- 30-year mortgage rates: Live from FRED
- 15-year mortgage rates: Live from FRED

### Public Health
- County health metrics
- Smoking, obesity, teen birth rates
- Healthcare access

## Project Structure

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

- **Federal Reserve Economic Data (FRED)** - https://fred.stlouisfed.org/
   Series used: A191RL1Q225SBEA, CPIAUCSL, UNRATE, TXUR, TYLE348UR, PAYEMS, MEDLISPRIMM46340, TYLSA158MFRBDAL, TX0000000M175FRBDAL, MORTGAGE30US, MORTGAGE15US.
- **U.S. Census Bureau API (ACS 5-Year)** - https://api.census.gov/data.html
   Tables/subjects used for regional endpoints: B01003, B01002, B21001, B03003, B02001, B01001, S2301, S2403, B24031, C15002A, C15002B, C15002I.
- **County Health Rankings & Roadmaps** - https://www.countyhealthrankings.org/
   Texas annual files (2018-2025) used for county/MSA health and wellbeing comparisons.
- **Texas Open Data Portal (Comptroller sales tax dataset)** - https://data.texas.gov/
   Used for Tyler MSA city-level sales tax aggregation.
- **Texas Comptroller Revenue Transparency** - https://comptroller.texas.gov/transparency/revenue/
   Used for all-funds (excluding trusts) monthly revenue trend charts.

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
