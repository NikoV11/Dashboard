# Hibbs Monitor Dashboard

Interactive dashboard for tracking East Texas and U.S. economic indicators, built for the UT Tyler Hibbs Institute for Business and Economic Research.

Live dashboard:
`https://nikov11.github.io/Dashboard/public/`

## Latest Update

Last updated: May 29, 2026

Recent changes to Public Finances:
- Added automatic chart refresh when the selected period changes.
- Updated the Tyler MSA monthly sales tax chart to display a 12-month range cleanly without a horizontal scrollbar.
- Kept month labels visible and horizontal for the 12-month sales tax view.
- Refreshed April 2026 public finance figures so the latest available month appears in the dashboard.
- Automated current fiscal year Texas revenue updates by overlaying the live Texas Comptroller Monthly State Revenue Watch data on top of the historical workbook, with fallback support in the local server and static site flow.

## Dashboard Coverage

- U.S. economy: GDP, inflation, unemployment, nonfarm payroll employment
- Tyler MSA and Texas labor market indicators
- Tyler MSA sales tax collections
- Texas public finance and tax revenue figures
- Tyler housing indicators and U.S. mortgage rates

## Run Locally

```bash
npm install
npm start
```

Then open:
`http://localhost:3000/`

## Project Structure

- `public/`: live site files served by GitHub Pages
- `src/`: editable source JavaScript and CSS
- `server/`: local Express server and API endpoints
- `worker/`: Cloudflare Worker for deployed API/fallback workflows
- `docs/`: supporting project documentation

## Documentation

- [Full documentation](docs/README.md)
- [Excel and revenue data setup](docs/EXCEL_SETUP.md)
- [Project structure](docs/PROJECT_STRUCTURE.md)

## Data Sources

- Federal Reserve Economic Data (FRED)
- Texas Comptroller of Public Accounts
- Freddie Mac
