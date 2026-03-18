# Dashboard Data Sources

All data in this dashboard is sourced from official U.S. government and economic data APIs. Below is a comprehensive guide to each data source.

## Live Data Endpoints

### 1. **FRED API - Economic Indicators** (Federal Reserve Economic Data)
**Source:** St. Louis Federal Reserve  
**URL:** https://api.stlouisfed.org/fred/  
**Endpoint:** `/api/fred/series/observations`

**Data Included:**
- Real GDP (quarterly % change) - Series ID: A191RL1Q225SBEA
- CPI-U (monthly % change) - Series ID: CPIAUCSL
- Unemployment Rate (U.S.) - Series ID: UNRATE
- Texas Unemployment Rate - Series ID: TXUR
- Tyler MSA Unemployment - Series ID: TYLE348UR
- Total Payroll Employment - Series ID: PAYEMS
- US Mortgage Rates (30-year) - Series ID: MORTGAGE30US
- US Mortgage Rates (15-year) - Series ID: MORTGAGE15US
- Texas Payroll (Statewide) - Series ID: TX0000000M175FRBDAL
- Tyler Payroll (MSA) - Series ID: TYLSA158MFRBDAL
- Median Home Prices (Tyler Metro) - Series ID: MEDLISPRIMM46340

**Setup Required:**
1. Get free API key from: https://fred.stlouisfed.org/docs/api/
2. Add to `.env` file:
   ```
   FRED_API_KEY=your_api_key_here
   ```

**Update Frequency:** Daily (FRED updates as new data is released)

### 2. **Census Bureau ACS API - Demographic & Education Data**
**Source:** U.S. Census Bureau American Community Survey (ACS) 5-Year Estimates  
**URL:** https://api.census.gov/data/

**Endpoints:**
- `/api/tx-regional-demographics` - Population, age, race composition
- `/api/tx-education-attainment` - Educational attainment by race
- `/api/tx-regional-employment` - Employment by industry & wages

**Data Included:**

#### Educational Attainment (by Race/Ethnicity)
- **White alone, non-Hispanic** (C15002A)
- **Black/African American alone** (C15002B)
- **Hispanic/Latino** (C15002I)
- **Asian alone** (C15002D)
- **Other** - Combined from:
  - American Indian/Alaska Native (C15002C)
  - Native Hawaiian/Pacific Islander (C15002E)
  - Some other race alone (C15002F)
  - Two or more races (C15002G)

Education Levels Tracked:
- Bachelor's degree or higher
- High school diploma (with or without college)
- Less than high school diploma
- Some college or associate's degree

#### Demographics (Metro Areas)
- Total population
- Median age
- Age distribution (8 age groups)
- Race/ethnicity composition
- Veteran population share
- Hispanic population share

#### Employment (Texas Counties)
- Unemployment rate
- Labor force participation rate
- Employment by industry:
  - Natural Resources & Mining
  - Construction
  - Manufacturing
  - Wholesale Trade
  - Retail Trade
  - Transportation & Utilities
  - Information
  - Financial Activities
  - Professional & Business Services
  - Education & Health Services
  - Leisure & Hospitality
  - Government
- Weekly wages by industry

**Metro Areas Tracked:**
- Tyler, TX
- Waco, TX
- Dallas-Fort Worth-Arlington, TX
- Houston-The Woodlands-Sugar Land, TX
- Austin-Round Rock-Georgetown, TX
- San Antonio-New Braunfels, TX
- Longview, TX
- Beaumont-Port Arthur, TX

**Update Frequency:** Annual (Census releases new ACS 5-year estimates each year)  
**Data Lag:** 1-2 years (ACS 5-year averages)

**Example Request:**
```bash
GET /api/tx-education-attainment?years=2019,2020,2021,2022,2023,2024
```

Response includes all 5 races and all education levels for each year.

### 3. **County Health Rankings - Texas Health Data**
**Source:** Robert Wood Johnson Foundation / University of Wisconsin Population Health Institute  
**URL:** https://www.countyhealthrankings.org/

**Data Included:**
- Premature death (Years of Potential Life Lost)
- Percent reporting fair/poor health
- Smoking rates
- Obesity rates
- Teen birth rates
- Primary care physician availability
- Uninsured population percentage

**Update Frequency:** Annual  
**Data Lag:** 1-2 years

## Data Architecture

### Caching Strategy
- **Census API:** 24-hour cache (due to low update frequency)
- **FRED API:** 1-hour cache (updates daily)
- **Health Data:** 24-hour cache

Caches are stored in-memory on the server and reset when the server restarts.

### Error Handling
- If a Census API year fails, the endpoint returns data from the nearest available year
- If FRED API is unavailable, fallback to sample data
- All endpoints return error messages with details about what failed

## Frontend Configuration

The dashboard uses these endpoints automatically:

```javascript
// Economic data (FRED)
const FRED_URL = '/api/fred/series/observations';

// Census data
const CENSUS_ENDPOINTS = {
  demographics: '/api/tx-regional-demographics',
  education: '/api/tx-education-attainment',
  employment: '/api/tx-regional-employment'
};
```

## Adding New Data Sources

To add a new live data source:

1. **Server-side** (`server/server.js`):
   - Create fetch function for new API
   - Add caching logic
   - Create route (e.g., `/api/my-data`)
   - Handle errors gracefully

2. **Client-side** (`src/js/dashboard.js`):
   - Update fetch URLs
   - Add chart creation function
   - Handle new data structure

3. **Documentation**:
   - Update this file
   - Add source attribution
   - Note update frequency

## Data Quality Notes

- **Census Data:** Estimates based on 5-year samples; margins of error exist
- **FRED Data:** Official data from Federal Reserve; highly reliable
- **Health Data:** Compiled from multiple public health sources
- **Employment Data:** From Census Bureau annual estimates

## Privacy & Terms

- All data sources are public APIs
- No personal or private data is stored
- See individual API terms:
  - FRED: https://fred.stlouisfed.org/docs/api/
  - Census: https://api.census.gov/data/key_signup.html
  - County Health Rankings: https://www.countyhealthrankings.org/

## Geographic Coverage

**Primary Focus:** Texas Metro Areas  
**Secondary Coverage:** United States (for economic indicators)  
**Counties:** All Texas counties (for health data)

## Data Processing

Data is normalized and calculated as follows:
- **Percentages:** Displayed to 1-2 decimal places
- **Distributions:** Normalized to sum to 100%
- **Rates:** Shown as per 100,000 or per 1,000 as appropriate
- **Years:** Sorted chronologically
