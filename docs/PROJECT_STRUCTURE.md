# Project Structure Documentation

## Overview

The Dashboard project follows a professional, organized folder structure designed for maintainability, scalability, and clear separation of concerns.

## Complete Directory Layout

```
Dashboard/
│
├── public/                        # Production-ready static files
│   ├── index.html                # Main HTML entry point
│   ├── styles.css                # Compiled/current CSS
│   ├── favicon.svg               # Browser tab icon
│   ├── images/                   # Image assets
│   │   ├── favicon.svg
│   │   └── utt_rgb_Level_1C_Hibbs_stacked-fullcolor (1).png
│   └── js/                       # JavaScript assets
│       └── (compiled files)
│
├── src/                           # Source code (for development)
│   ├── js/
│   │   └── dashboard.js          # Master application logic
│   │                             # - Chart.js integration
│   │                             # - Data fetching & processing
│   │                             # - UI interactions
│   │                             # - Export functionality
│   └── css/
│       └── styles.css            # Master stylesheet
│                                 # - Responsive design
│                                 # - Color scheme
│                                 # - Mobile optimization
│
├── data/                          # Data and data definitions
│   ├── raw/                       # Raw data files
│   │   └── dashboard-data.csv    # CSV data source
│   └── definitions/               # JavaScript data definitions
│       ├── employment-data.js    # Employment metrics
│       ├── mortgage-data.js      # Mortgage rate data
│       └── revenue-data.js       # Revenue and tax data
│
├── server/                        # Backend server code
│   └── server.js                 # Express.js server
│                                 # - API endpoints
│                                 # - Excel file upload
│                                 # - .R2 cloud storage integration
│
├── scripts/                       # Utility and build scripts
│   ├── compare-texas-revenue.mjs # Revenue comparison script
│   └── upload-excel-to-r2.js    # R2 cloud upload utility
│
├── reports/                       # Generated reports
│   ├── texas-revenue-fred-compare.csv   # Report data (CSV)
│   └── texas-revenue-fred-compare.json  # Report data (JSON)
│
├── docs/                          # Project documentation
│   ├── README.md                 # Full feature documentation
│   ├── EXCEL_SETUP.md            # Excel integration guide
│   └── PROJECT_STRUCTURE.md      # This file
│
├── .github/                       # GitHub configuration
│   └── copilot-instructions.md  # GitHub Copilot settings
│
├── .env.example                   # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM dependencies & scripts
├── package-lock.json             # Dependency lock file
└── README.md                      # Main project README
```

## Directory Responsibilities

### `public/`
**Purpose:** Production-ready static files served to users
- `index.html` - Main page structure
- `styles.css` - Final CSS stylesheet
- `favicon.svg` - Browser icon
- `images/` - Logo and UI assets
- `js/` - Compiled or ready-to-use JavaScript

### `src/`
**Purpose:** Source code for development and maintenance
- Keep original, modular JavaScript and CSS
- Used during development and for version control
- Files can be compiled/minified for production
- `js/dashboard.js` contains core application logic
- `css/styles.css` contains master stylesheets

### `data/`
**Purpose:** Data sources and data definitions
- `raw/` - Raw CSV and data files from external sources
- `definitions/` - JavaScript modules that define data structures
  - `employment-data.js` - Employment statistics
  - `mortgage-data.js` - Mortgage rate information
  - `revenue-data.js` - Revenue and tax data

### `docs/`
**Purpose:** All documentation and guides
- `README.md` - Full feature and architecture documentation
- `EXCEL_SETUP.md` - Guide for Excel data integration
- `PROJECT_STRUCTURE.md` - This file, structure reference

### `server/`
**Purpose:** Backend and API code
- Express.js server
- API endpoints for data operations
- File upload handling
- Cloud storage integration (Cloudflare R2)

### `scripts/`
**Purpose:** Utility and automation scripts
- Data processing scripts
- Build automation
- Report generation
- File upload utilities

### `reports/`
**Purpose:** Generated output files
- CSV reports
- JSON data exports
- Analysis results

### `.github/`
**Purpose:** GitHub-specific configuration
- CI/CD workflows
- GitHub Copilot instructions
- Issue templates

## File Reference Architecture

### How Files Reference Each Other

```
public/index.html
└── References:
    ├── src/css/styles.css  (or public/styles.css)
    ├── src/js/dashboard.js (or public/js/dashboard.js)
    ├── data/definitions/employment-data.js
    ├── data/definitions/mortgage-data.js
    ├── data/definitions/revenue-data.js
    └── data/raw/dashboard-data.csv

src/js/dashboard.js
└── References:
    ├── Chart.js library (CDN)
    ├── FRED API endpoint
    ├── Data definition files
    └── HTML DOM elements
```

## Development Workflow

### 1. Making Changes
- Edit source files in `src/`
- Update corresponding files in `public/` (or use build process)
- Test in browser via `public/index.html`

### 2. Adding Data
- Add raw data to `data/raw/`
- Create definition files in `data/definitions/`
- Update `dashboard.js` to load new data

### 3. Adding Features
- Create new modules in `src/js/` if needed
- Import into `src/js/dashboard.js`
- Compile/bundle for `public/`

### 4. Deploying
- Ensure `public/` files are production-ready
- Run tests against `public/` files
- Deploy `public/` folder to hosting

## Key Principles

### Separation of Concerns
- **Source vs. Production**: `src/` for development, `public/` for deployment
- **Data vs. Code**: Data files separate from application logic
- **Backend vs. Frontend**: `server/` code separate from `public/`

### Organization by Type
- **Data organization**: Raw data vs. definitions
- **Documentation**: All docs in `docs/`
- **Scripts**: Utilities grouped in `scripts/`
- **Reports**: Generated files in `reports/`

### Scalability
- Structure supports adding new data sources
- Easy to add new features without reorganizing
- Clear paths for supporting new chart types
- Modular design allows feature isolation

## File Naming Conventions

- **HTML**: kebab-case (index.html)
- **JavaScript**: kebab-case for files (dashboard.js, employment-data.js)
- **CSS**: kebab-case for files (styles.css)
- **Data**: kebab-case with descriptive names (dashboard-data.csv)
- **Directories**: lowercase, singular when possible

## Development Tips

1. **Always edit source files first** (`src/`)
2. **Keep `public/` synchronized** with your changes
3. **Use relative paths** for file references
4. **Group related files** in appropriate directories
5. **Update documentation** when adding features

## Integration with Version Control

- **Branch Strategy**: Feature branches off `main` or `develop`
- **Commits**: Organized by feature or bug fix
- **Ignored Files**: `node_modules/`, `.env`, `.DS_Store`
- **Tracked Directories**: `src/`, `public/`, `data/`, `docs/`, `scripts/`, `server/`

## Migration Guide

If migrating from old structure:

1. ✅ Move data files to `data/raw/` and `data/definitions/`
2. ✅ Keep `src/` as primary source location
3. ✅ Ensure `public/` is always deployment-ready
4. ✅ Consolidate documentation in `docs/`
5. ✅ Update all relative paths in HTML/JS
6. ✅ Test all references in browser
7. ✅ Commit organized structure to git

---

**Last Updated:** February 2026  
**Version:** 2.0 (Professional Structure)
