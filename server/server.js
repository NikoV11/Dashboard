const path = require('path');
const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const XLSX = require('xlsx');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    })
);

app.use(express.json());

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');
const imagesDir = path.join(rootDir, 'images');
const dataDir = path.join(rootDir, 'data');

app.use('/', express.static(publicDir));
app.use('/src', express.static(srcDir));
app.use('/images', express.static(imagesDir));
app.use('/data', express.static(dataDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/api/fred/series/observations', async (req, res) => {
    const apiKey = process.env.FRED_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'Server misconfigured: missing FRED_API_KEY'
        });
    }

    const url = new URL('https://api.stlouisfed.org/fred/series/observations');

    Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 0) {
            url.searchParams.set(key, value);
        }
    });

    if (!url.searchParams.has('file_type')) {
        url.searchParams.set('file_type', 'json');
    }

    if (!url.searchParams.has('limit')) {
        url.searchParams.set('limit', '10000');
    }

    url.searchParams.set('api_key', apiKey);

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            const message = await response.text();
            return res.status(response.status).send(message);
        }

        const payload = await response.json();
        res.set('Cache-Control', 'public, max-age=600');
        return res.json(payload);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to reach FRED API',
            detail: error?.message || String(error)
        });
    }
});

const TEXAS_HEALTH_FILE_URLS = {
    2018: 'https://www.countyhealthrankings.org/sites/default/files/media/document/state/downloads/2018%20County%20Health%20Rankings%20Texas%20Data%20-%20v3.xls',
    2019: 'https://www.countyhealthrankings.org/sites/default/files/media/document/state/downloads/2019%20County%20Health%20Rankings%20Texas%20Data%20-%20v1_0.xls',
    2020: 'https://www.countyhealthrankings.org/sites/default/files/media/document/2020%20County%20Health%20Rankings%20Texas%20Data%20-%20v1_0.xlsx',
    2021: 'https://www.countyhealthrankings.org/sites/default/files/media/document/2021%20County%20Health%20Rankings%20Texas%20Data%20-%20v1.xlsx',
    2022: 'https://www.countyhealthrankings.org/sites/default/files/media/document/2022%20County%20Health%20Rankings%20Texas%20Data%20-%20v1.xlsx',
    2023: 'https://www.countyhealthrankings.org/sites/default/files/media/document/2023%20County%20Health%20Rankings%20Texas%20Data%20-%20v2.xlsx',
    2024: 'https://www.countyhealthrankings.org/sites/default/files/media/document/2024%20County%20Health%20Rankings%20Texas%20Data%20-%20v2.xlsx',
    2025: 'https://www.countyhealthrankings.org/sites/default/files/media/document/2025%20County%20Health%20Rankings%20Texas%20Data%20-%20v3.xlsx'
};

const WORKBOOK_SHEET_NAME = 'Select Measure Data';
const texasHealthCache = new Map();
let countiesGeoJsonCache = null;
const texasRegionalEmploymentCache = new Map();

const CENSUS_SUBJECT_VARS = [
    'NAME',
    'S2301_C02_001E',
    'S2301_C04_001E',
    'S2403_C01_002E',
    'S2403_C01_005E',
    'S2403_C01_006E',
    'S2403_C01_007E',
    'S2403_C01_008E',
    'S2403_C01_009E',
    'S2403_C01_016E',
    'S2403_C01_020E',
    'S2403_C01_023E',
    'S2403_C01_027E'
];

const CENSUS_EARNINGS_VARS = [
    'NAME',
    'B24031_002E',
    'B24031_005E',
    'B24031_006E',
    'B24031_007E',
    'B24031_008E',
    'B24031_009E',
    'B24031_016E',
    'B24031_020E',
    'B24031_023E',
    'B24031_027E'
];

const CENSUS_INDUSTRY_CONFIG = [
    {
        label: 'Natural Resources & Mining',
        employmentCodes: ['S2403_C01_002E'],
        earningsCodes: ['B24031_002E']
    },
    {
        label: 'Construction',
        employmentCodes: ['S2403_C01_005E'],
        earningsCodes: ['B24031_005E']
    },
    {
        label: 'Manufacturing',
        employmentCodes: ['S2403_C01_006E'],
        earningsCodes: ['B24031_006E']
    },
    {
        label: 'Trade, Transportation & Utilities',
        employmentCodes: ['S2403_C01_007E', 'S2403_C01_008E', 'S2403_C01_009E'],
        earningsCodes: ['B24031_007E', 'B24031_008E', 'B24031_009E']
    },
    {
        label: 'Professional & Business Services',
        employmentCodes: ['S2403_C01_016E'],
        earningsCodes: ['B24031_016E']
    },
    {
        label: 'Education & Health Services',
        employmentCodes: ['S2403_C01_020E'],
        earningsCodes: ['B24031_020E']
    },
    {
        label: 'Leisure & Hospitality',
        employmentCodes: ['S2403_C01_023E'],
        earningsCodes: ['B24031_023E']
    },
    {
        label: 'Government',
        employmentCodes: ['S2403_C01_027E'],
        earningsCodes: ['B24031_027E']
    }
];

const TX_METRO_LOCATIONS = [
    { code: '46340', name: 'Tyler, TX Metro Area' },
    { code: '47380', name: 'Waco, TX Metro Area' },
    { code: '19100', name: 'Dallas-Fort Worth-Arlington, TX Metro Area' },
    { code: '26420', name: 'Houston-The Woodlands-Sugar Land, TX Metro Area' },
    { code: '12420', name: 'Austin-Round Rock-Georgetown, TX Metro Area' },
    { code: '41700', name: 'San Antonio-New Braunfels, TX Metro Area' },
    { code: '30980', name: 'Longview, TX Metro Area' },
    { code: '13140', name: 'Beaumont-Port Arthur, TX Metro Area' }
];

const REGIONAL_COMPARISON_YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

const REGIONAL_DEMOGRAPHICS_AGE_GROUPS = [
    { key: 'under18', label: 'Under 18' },
    { key: 'age18to24', label: '18 to 24' },
    { key: 'age25to34', label: '25 to 34' },
    { key: 'age35to44', label: '35 to 44' },
    { key: 'age45to54', label: '45 to 54' },
    { key: 'age55to64', label: '55 to 64' },
    { key: 'age65to74', label: '65 to 74' },
    { key: 'age75plus', label: '75 and over' }
];

const REGIONAL_DEMOGRAPHICS_RACE_GROUPS = [
    { key: 'white', label: 'White', color: '#4E8446' },
    { key: 'black', label: 'Black', color: '#9CD4DC' },
    { key: 'asian', label: 'Asian', color: '#4A90E2' },
    { key: 'other', label: 'Other / Multiracial', color: '#BEDFB5' }
];

const texasRegionalDemographicsCache = new Map();
const texasEducationAttainmentCache = new Map();

function censusCode(prefix, number) {
    return `${prefix}_${String(number).padStart(3, '0')}E`;
}

function censusCodesRange(prefix, start, end) {
    const codes = [];
    for (let i = start; i <= end; i += 1) {
        codes.push(censusCode(prefix, i));
    }
    return codes;
}

const CENSUS_B01001_AGE_CODES = censusCodesRange('B01001', 3, 25)
    .concat(censusCodesRange('B01001', 27, 49));

const CENSUS_DEMOGRAPHICS_BASE_VARS = [
    'NAME',
    'B01003_001E',
    'B01002_001E',
    'B21001_001E',
    'B21001_002E',
    'B03003_001E',
    'B03003_003E',
    'B02001_001E',
    'B02001_002E',
    'B02001_003E',
    'B02001_005E'
];

const CENSUS_DEMOGRAPHICS_AGE_VARS = ['NAME', ...CENSUS_B01001_AGE_CODES];

const CENSUS_EDUCATION_A_VARS = ['NAME', ...censusCodesRange('C15002A', 1, 11)]; // White alone
const CENSUS_EDUCATION_B_VARS = ['NAME', ...censusCodesRange('C15002B', 1, 11)]; // Black alone
const CENSUS_EDUCATION_I_VARS = ['NAME', ...censusCodesRange('C15002I', 1, 11)]; // Hispanic or Latino
const CENSUS_EDUCATION_D_VARS = ['NAME', ...censusCodesRange('C15002D', 1, 11)]; // Asian alone
const CENSUS_EDUCATION_C_VARS = ['NAME', ...censusCodesRange('C15002C', 1, 11)]; // American Indian/Alaska Native
const CENSUS_EDUCATION_E_VARS = ['NAME', ...censusCodesRange('C15002E', 1, 11)]; // Native Hawaiian/Pacific Islander
const CENSUS_EDUCATION_F_VARS = ['NAME', ...censusCodesRange('C15002F', 1, 11)]; // Some other race alone
const CENSUS_EDUCATION_G_VARS = ['NAME', ...censusCodesRange('C15002G', 1, 11)]; // Two or more races

function roundTo(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function safePercent(numerator, denominator, digits = 1) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
        return null;
    }

    return roundTo((numerator / denominator) * 100, digits);
}

function normalizeDistribution(source, orderedKeys, digits = 1) {
    const factor = 10 ** digits;
    const normalized = {};
    const total = orderedKeys.reduce((sum, key) => sum + (Number(source[key]) || 0), 0);

    if (total <= 0) {
        orderedKeys.forEach((key) => {
            normalized[key] = null;
        });
        return normalized;
    }

    let running = 0;
    orderedKeys.forEach((key, index) => {
        if (index === orderedKeys.length - 1) {
            normalized[key] = roundTo(100 - running, digits);
            return;
        }

        const raw = ((Number(source[key]) || 0) / total) * 100;
        const rounded = Math.round(raw * factor) / factor;
        normalized[key] = rounded;
        running = roundTo(running + rounded, digits);
    });

    return normalized;
}

async function fetchCensusMetroRecord(year, variables, metroCode) {
    const url = new URL(`https://api.census.gov/data/${year}/acs/acs5`);
    url.searchParams.set('get', variables.join(','));
    url.searchParams.set('for', `metropolitan statistical area/micropolitan statistical area:${metroCode}`);

    const rows = await fetchCensusJson(url);
    if (!Array.isArray(rows) || rows.length < 2) {
        throw new Error(`Census metro response missing data for ${metroCode} (${year}).`);
    }

    return {
        headers: rows[0],
        row: rows[1]
    };
}

function sumCensusCodes(headers, row, codes) {
    return codes.reduce((sum, code) => {
        const value = readCensusValue(headers, row, code);
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
}

function rowToCensusValueMap(headers, row) {
    const map = new Map();
    headers.forEach((key, index) => {
        map.set(key, parseCensusNumeric(row[index]));
    });
    return map;
}

function sumCensusValues(valueMap, codes) {
    return codes.reduce((sum, code) => {
        const value = valueMap.get(code);
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
}

function computeMetroDemographicsRecord(valueMap) {
    const totalPopulation = valueMap.get('B01003_001E');
    const medianAge = valueMap.get('B01002_001E');
    const veteranPopulation = valueMap.get('B21001_002E');
    const civilianAdultPopulation = valueMap.get('B21001_001E');
    const hispanicPopulation = valueMap.get('B03003_003E');
    const ethnicityPopulation = valueMap.get('B03003_001E');

    const under18 = sumCensusValues(valueMap, [
        'B01001_003E', 'B01001_004E', 'B01001_005E', 'B01001_006E',
        'B01001_027E', 'B01001_028E', 'B01001_029E', 'B01001_030E'
    ]);
    const age18to24 = sumCensusValues(valueMap, [
        'B01001_007E', 'B01001_008E', 'B01001_009E', 'B01001_010E',
        'B01001_031E', 'B01001_032E', 'B01001_033E', 'B01001_034E'
    ]);
    const age25to34 = sumCensusValues(valueMap, ['B01001_011E', 'B01001_012E', 'B01001_035E', 'B01001_036E']);
    const age35to44 = sumCensusValues(valueMap, ['B01001_013E', 'B01001_014E', 'B01001_037E', 'B01001_038E']);
    const age45to54 = sumCensusValues(valueMap, ['B01001_015E', 'B01001_016E', 'B01001_039E', 'B01001_040E']);
    const age55to64 = sumCensusValues(valueMap, ['B01001_017E', 'B01001_018E', 'B01001_041E', 'B01001_042E']);
    const age65to74 = sumCensusValues(valueMap, [
        'B01001_019E', 'B01001_020E', 'B01001_021E',
        'B01001_043E', 'B01001_044E', 'B01001_045E'
    ]);
    const age75plus = sumCensusValues(valueMap, [
        'B01001_022E', 'B01001_023E', 'B01001_024E', 'B01001_025E',
        'B01001_046E', 'B01001_047E', 'B01001_048E', 'B01001_049E'
    ]);

    const ageDistribution = normalizeDistribution({
        under18,
        age18to24,
        age25to34,
        age35to44,
        age45to54,
        age55to64,
        age65to74,
        age75plus
    }, REGIONAL_DEMOGRAPHICS_AGE_GROUPS.map((group) => group.key), 1);

    const raceTotal = valueMap.get('B02001_001E');
    const white = valueMap.get('B02001_002E');
    const black = valueMap.get('B02001_003E');
    const asian = valueMap.get('B02001_005E');
    const other = Number.isFinite(raceTotal) && Number.isFinite(white) && Number.isFinite(black) && Number.isFinite(asian)
        ? Math.max(0, raceTotal - white - black - asian)
        : null;

    const raceComposition = normalizeDistribution({
        white: Number.isFinite(white) ? white : 0,
        black: Number.isFinite(black) ? black : 0,
        asian: Number.isFinite(asian) ? asian : 0,
        other: Number.isFinite(other) ? other : 0
    }, REGIONAL_DEMOGRAPHICS_RACE_GROUPS.map((group) => group.key), 1);

    return {
        totalPopulation: Number.isFinite(totalPopulation) ? Math.round(totalPopulation) : null,
        medianAge: Number.isFinite(medianAge) ? roundTo(medianAge, 1) : null,
        veteranShare: safePercent(veteranPopulation, civilianAdultPopulation, 1),
        hispanicShare: safePercent(hispanicPopulation, ethnicityPopulation, 1),
        ageDistribution,
        raceComposition
    };
}

async function loadTexasRegionalDemographicsYear(year) {
    if (texasRegionalDemographicsCache.has(year)) {
        return texasRegionalDemographicsCache.get(year);
    }

    const rows = await Promise.all(TX_METRO_LOCATIONS.map(async (metro) => {
        const [baseRecord, ageRecord] = await Promise.all([
            fetchCensusMetroRecord(year, CENSUS_DEMOGRAPHICS_BASE_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_DEMOGRAPHICS_AGE_VARS, metro.code)
        ]);

        const mergedValues = new Map([
            ...rowToCensusValueMap(baseRecord.headers, baseRecord.row),
            ...rowToCensusValueMap(ageRecord.headers, ageRecord.row)
        ]);

        return {
            location: metro.name,
            record: computeMetroDemographicsRecord(mergedValues)
        };
    }));

    const byLocation = {};
    rows.forEach(({ location, record }) => {
        byLocation[location] = record;
    });

    texasRegionalDemographicsCache.set(year, byLocation);
    return byLocation;
}

function educationBucketFromRaceTable(headers, row, prefix) {
    const total = readCensusValue(headers, row, `${prefix}_001E`);
    const noHighSchool = sumCensusCodes(headers, row, [`${prefix}_003E`, `${prefix}_008E`]);
    const highSchool = sumCensusCodes(headers, row, [`${prefix}_004E`, `${prefix}_009E`]);
    const someCollege = sumCensusCodes(headers, row, [`${prefix}_005E`, `${prefix}_010E`]);
    const bachelors = sumCensusCodes(headers, row, [`${prefix}_006E`, `${prefix}_011E`]);

    if (!Number.isFinite(total) || total <= 0) {
        return {
            bachelors: null,
            highSchool: null,
            noHighSchool: null,
            someCollege: null
        };
    }

    const normalized = normalizeDistribution({
        bachelors,
        highSchool,
        noHighSchool,
        someCollege
    }, ['bachelors', 'highSchool', 'noHighSchool', 'someCollege'], 2);

    return {
        bachelors: normalized.bachelors,
        highSchool: normalized.highSchool,
        noHighSchool: normalized.noHighSchool,
        someCollege: normalized.someCollege
    };
}

function computeOtherRaceEducation(nativeAmRecord, hawaiianRecord, otherRaceRecord, multiraceRecord) {
    // Combine education data from C, E, F, G tables into "Other" category
    const tables = [
        { record: nativeAmRecord, prefix: 'C15002C' },
        { record: hawaiianRecord, prefix: 'C15002E' },
        { record: otherRaceRecord, prefix: 'C15002F' },
        { record: multiraceRecord, prefix: 'C15002G' }
    ];

    let totalPop = 0;
    let totalNoHS = 0;
    let totalHS = 0;
    let totalSomeCollege = 0;
    let totalBackelors = 0;

    tables.forEach(({ record, prefix }) => {
        if (!record || !record.headers || !record.row) return;
        
        const pop = readCensusValue(record.headers, record.row, `${prefix}_001E`);
        if (!Number.isFinite(pop) || pop <= 0) return;

        totalPop += pop;
        totalNoHS += sumCensusCodes(record.headers, record.row, [`${prefix}_003E`, `${prefix}_008E`]);
        totalHS += sumCensusCodes(record.headers, record.row, [`${prefix}_004E`, `${prefix}_009E`]);
        totalSomeCollege += sumCensusCodes(record.headers, record.row, [`${prefix}_005E`, `${prefix}_010E`]);
        totalBackelors += sumCensusCodes(record.headers, record.row, [`${prefix}_006E`, `${prefix}_011E`]);
    });

    if (totalPop <= 0) {
        return {
            bachelors: null,
            highSchool: null,
            noHighSchool: null,
            someCollege: null
        };
    }

    const normalized = normalizeDistribution({
        bachelors: totalBackelors,
        highSchool: totalHS,
        noHighSchool: totalNoHS,
        someCollege: totalSomeCollege
    }, ['bachelors', 'highSchool', 'noHighSchool', 'someCollege'], 2);

    return {
        bachelors: normalized.bachelors,
        highSchool: normalized.highSchool,
        noHighSchool: normalized.noHighSchool,
        someCollege: normalized.someCollege
    };
}

async function loadTexasEducationAttainmentYear(year) {
    if (texasEducationAttainmentCache.has(year)) {
        return texasEducationAttainmentCache.get(year);
    }

    const rows = await Promise.all(TX_METRO_LOCATIONS.map(async (metro) => {
        const [white, black, hispanic, asian, nativeAm, hawaiian, otherRace, multirace] = await Promise.all([
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_A_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_B_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_I_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_D_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_C_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_E_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_F_VARS, metro.code),
            fetchCensusMetroRecord(year, CENSUS_EDUCATION_G_VARS, metro.code)
        ]);

        return {
            location: metro.name,
            record: {
                White: educationBucketFromRaceTable(white.headers, white.row, 'C15002A'),
                Black: educationBucketFromRaceTable(black.headers, black.row, 'C15002B'),
                Hispanic: educationBucketFromRaceTable(hispanic.headers, hispanic.row, 'C15002I'),
                Asian: educationBucketFromRaceTable(asian.headers, asian.row, 'C15002D'),
                Other: computeOtherRaceEducation(nativeAm, hawaiian, otherRace, multirace)
            }
        };
    }));

    const byLocation = {};
    rows.forEach(({ location, record }) => {
        byLocation[location] = record;
    });

    texasEducationAttainmentCache.set(year, byLocation);
    return byLocation;
}

function parseNumeric(value) {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized || normalized === 'x' || normalized === 'na' || normalized === 'n/a') {
        return null;
    }

    const parsed = Number.parseFloat(String(value).replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
}

function parseCensusNumeric(value) {
    const raw = String(value ?? '').trim();
    if (!raw || raw === '-666666666' || raw === 'null') {
        return null;
    }

    const parsed = Number.parseFloat(raw.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
}

function parseTexasCountyNameFromCensus(name) {
    return String(name || '')
        .replace(/,\s*Texas$/i, '')
        .replace(/\s+County$/i, '')
        .trim();
}

async function fetchCensusJson(url) {
    const response = await fetch(url.toString());
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Census request failed (${response.status}): ${body.slice(0, 240)}`);
    }

    return response.json();
}

function censusRowsToMap(rows) {
    if (!Array.isArray(rows) || rows.length < 2) {
        return new Map();
    }

    const headers = rows[0];
    const stateIndex = headers.indexOf('state');
    const countyIndex = headers.indexOf('county');
    if (stateIndex < 0 || countyIndex < 0) {
        return new Map();
    }

    const map = new Map();
    rows.slice(1).forEach((row) => {
        const state = String(row[stateIndex] || '').trim();
        const county = String(row[countyIndex] || '').trim();
        if (!/^48$/.test(state) || !/^\d{3}$/.test(county)) {
            return;
        }

        map.set(`${state}${county}`, row);
    });

    return map;
}

function readCensusValue(headers, row, key) {
    const index = headers.indexOf(key);
    if (index < 0) {
        return null;
    }

    return parseCensusNumeric(row[index]);
}

function computeWeeklyIndustryWage(headers, earningsRow, employmentHeaders, employmentRow, earningsCodes, employmentCodes) {
    if (!earningsRow || !Array.isArray(earningsCodes) || !earningsCodes.length) {
        return null;
    }

    if (earningsCodes.length === 1) {
        const annual = readCensusValue(headers, earningsRow, earningsCodes[0]);
        return Number.isFinite(annual) ? annual / 52 : null;
    }

    let weightedAnnualTotal = 0;
    let weightedEmploymentTotal = 0;
    let simpleAnnualTotal = 0;
    let simpleCount = 0;

    for (let i = 0; i < earningsCodes.length; i += 1) {
        const annual = readCensusValue(headers, earningsRow, earningsCodes[i]);
        if (!Number.isFinite(annual)) {
            continue;
        }

        simpleAnnualTotal += annual;
        simpleCount += 1;

        const employmentCode = employmentCodes[i];
        const employment = employmentCode
            ? readCensusValue(employmentHeaders, employmentRow, employmentCode)
            : null;

        if (Number.isFinite(employment) && employment > 0) {
            weightedAnnualTotal += annual * employment;
            weightedEmploymentTotal += employment;
        }
    }

    if (weightedEmploymentTotal > 0) {
        return (weightedAnnualTotal / weightedEmploymentTotal) / 52;
    }

    return simpleCount > 0 ? (simpleAnnualTotal / simpleCount) / 52 : null;
}

async function loadTexasRegionalEmploymentYear(year) {
    if (texasRegionalEmploymentCache.has(year)) {
        return texasRegionalEmploymentCache.get(year);
    }

    const subjectUrl = new URL(`https://api.census.gov/data/${year}/acs/acs5/subject`);
    subjectUrl.searchParams.set('get', CENSUS_SUBJECT_VARS.join(','));
    subjectUrl.searchParams.set('for', 'county:*');
    subjectUrl.searchParams.set('in', 'state:48');

    const earningsUrl = new URL(`https://api.census.gov/data/${year}/acs/acs5`);
    earningsUrl.searchParams.set('get', CENSUS_EARNINGS_VARS.join(','));
    earningsUrl.searchParams.set('for', 'county:*');
    earningsUrl.searchParams.set('in', 'state:48');

    const [subjectRows, earningsRows] = await Promise.all([
        fetchCensusJson(subjectUrl),
        fetchCensusJson(earningsUrl)
    ]);

    const subjectHeaders = Array.isArray(subjectRows) && subjectRows.length ? subjectRows[0] : [];
    const earningsHeaders = Array.isArray(earningsRows) && earningsRows.length ? earningsRows[0] : [];
    const subjectMap = censusRowsToMap(subjectRows);
    const earningsMap = censusRowsToMap(earningsRows);

    const records = [];
    subjectMap.forEach((subjectRow, fips) => {
        const earningsRow = earningsMap.get(fips);
        if (!earningsRow) {
            return;
        }

        const countyNameRaw = String(subjectRow[subjectHeaders.indexOf('NAME')] || '').trim();
        const county = parseTexasCountyNameFromCensus(countyNameRaw);
        if (!county) {
            return;
        }

        const industryEmployment = {};
        const weeklyWages = {};

        CENSUS_INDUSTRY_CONFIG.forEach((industry) => {
            const totalEmployment = industry.employmentCodes.reduce((sum, code) => {
                const value = readCensusValue(subjectHeaders, subjectRow, code);
                return sum + (Number.isFinite(value) ? value : 0);
            }, 0);

            industryEmployment[industry.label] = totalEmployment > 0
                ? Math.round(totalEmployment)
                : null;

            const weekly = computeWeeklyIndustryWage(
                earningsHeaders,
                earningsRow,
                subjectHeaders,
                subjectRow,
                industry.earningsCodes,
                industry.employmentCodes
            );

            weeklyWages[industry.label] = Number.isFinite(weekly)
                ? Math.round(weekly)
                : null;
        });

        records.push({
            year,
            fips,
            county,
            countyKey: normalizeCountyName(county),
            unemploymentRate: readCensusValue(subjectHeaders, subjectRow, 'S2301_C04_001E'),
            laborForceParticipationRate: readCensusValue(subjectHeaders, subjectRow, 'S2301_C02_001E'),
            weeklyWages,
            industryEmployment
        });
    });

    texasRegionalEmploymentCache.set(year, records);
    return records;
}

function normalizeCountyName(name) {
    return String(name || '').trim().toLowerCase();
}

function findColumnIndex(headerRow, label) {
    return headerRow.findIndex((cell) => String(cell || '').trim() === label);
}

function findColumnIndexAny(headerRow, aliases) {
    const normalized = headerRow.map((cell) => String(cell || '').trim().toLowerCase());
    for (const alias of aliases) {
        const target = String(alias || '').trim().toLowerCase();
        const idx = normalized.findIndex((cell) => cell === target);
        if (idx >= 0) return idx;
    }
    return -1;
}

function findHeaderRowIndex(rows) {
    const maxScanRows = Math.min(Array.isArray(rows) ? rows.length : 0, 12);
    for (let i = 0; i < maxScanRows; i += 1) {
        const row = rows[i] || [];
        const hasFips = findColumnIndex(row, 'FIPS') >= 0;
        const hasCounty = findColumnIndex(row, 'County') >= 0;
        if (hasFips && hasCounty) {
            return i;
        }
    }

    return -1;
}

function getCellValue(row, index) {
    if (!Array.isArray(row) || !Number.isInteger(index) || index < 0) {
        return null;
    }

    return row[index];
}

function resolveMetricValue(primaryRow, primaryIndex, fallbackRow, fallbackIndex) {
    const primaryValue = parseNumeric(getCellValue(primaryRow, primaryIndex));
    if (Number.isFinite(primaryValue)) {
        return primaryValue;
    }

    return parseNumeric(getCellValue(fallbackRow, fallbackIndex));
}

function pickTexasMeasureSheet(workbook) {
    const preferred = workbook.SheetNames.find((name) => /select measure data/i.test(name));
    if (preferred) return preferred;

    const ranked = workbook.SheetNames.find((name) => /ranked measure data/i.test(name));
    if (ranked) return ranked;

    return workbook.SheetNames[0];
}

async function loadTexasHealthYear(year) {
    if (texasHealthCache.has(year)) {
        return texasHealthCache.get(year);
    }

    const url = TEXAS_HEALTH_FILE_URLS[year];
    if (!url) {
        return [];
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch Texas health workbook for ${year}: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const primarySheetName = pickTexasMeasureSheet(workbook);
    const primarySheet = workbook.Sheets[primarySheetName];
    if (!primarySheet) {
        throw new Error(`Missing worksheet for ${year}`);
    }

    const primaryRows = XLSX.utils.sheet_to_json(primarySheet, { header: 1, defval: '' });
    const primaryHeaderIndex = findHeaderRowIndex(primaryRows);
    if (primaryHeaderIndex < 0) {
        throw new Error(`Unable to locate header row for ${year} in sheet ${primarySheetName}`);
    }

    const primaryHeader = primaryRows[primaryHeaderIndex] || [];
    const primaryDataRows = primaryRows.slice(primaryHeaderIndex + 1);

    const additionalSheetName = workbook.SheetNames.find((name) => /additional measure data/i.test(name));
    const additionalByFips = new Map();
    let additionalIndices = {
        fips: -1,
        smoking: -1,
        obesity: -1,
        teenBirth: -1,
        uninsuredPct: -1
    };

    if (additionalSheetName) {
        const additionalSheet = workbook.Sheets[additionalSheetName];
        const additionalRows = XLSX.utils.sheet_to_json(additionalSheet, { header: 1, defval: '' });
        const additionalHeaderIndex = findHeaderRowIndex(additionalRows);

        if (additionalHeaderIndex >= 0) {
            const additionalHeader = additionalRows[additionalHeaderIndex] || [];
            additionalIndices = {
                fips: findColumnIndex(additionalHeader, 'FIPS'),
                smoking: findColumnIndexAny(additionalHeader, ['% Adults Reporting Currently Smoking', '% Smokers']),
                obesity: findColumnIndexAny(additionalHeader, ['% Adults with Obesity', '% Obese']),
                teenBirth: findColumnIndexAny(additionalHeader, ['Teen Birth Rate']),
                uninsuredPct: findColumnIndexAny(additionalHeader, ['% Uninsured', '% Uninsured Adults'])
            };

            additionalRows.slice(additionalHeaderIndex + 1).forEach((row) => {
                const fipsRaw = getCellValue(row, additionalIndices.fips);
                const fips = String(fipsRaw || '').trim();
                if (/^48\d{3}$/.test(fips)) {
                    additionalByFips.set(fips, row);
                }
            });
        }
    }

    const indices = {
        fips: findColumnIndex(primaryHeader, 'FIPS'),
        county: findColumnIndex(primaryHeader, 'County'),
        prematureDeath: findColumnIndexAny(primaryHeader, ['Years of Potential Life Lost Rate']),
        poorHealth: findColumnIndexAny(primaryHeader, ['% Fair or Poor Health', '% Fair/Poor']),
        smoking: findColumnIndexAny(primaryHeader, ['% Adults Reporting Currently Smoking', '% Smokers']),
        obesity: findColumnIndexAny(primaryHeader, ['% Adults with Obesity', '% Obese']),
        teenBirth: findColumnIndexAny(primaryHeader, ['Teen Birth Rate']),
        uninsuredPct: findColumnIndexAny(primaryHeader, ['% Uninsured', '% Uninsured Adults']),
        primaryCareRate: findColumnIndexAny(primaryHeader, ['Primary Care Physicians Rate', 'PCP Rate'])
    };

    const required = ['fips', 'county', 'prematureDeath', 'poorHealth', 'uninsuredPct', 'primaryCareRate'];
    const missing = required.filter((key) => indices[key] < 0);
    if (missing.length > 0) {
        throw new Error(`Missing expected columns for ${year} in sheet ${primarySheetName}: ${missing.join(', ')}`);
    }

    const parsed = [];
    for (let i = 0; i < primaryDataRows.length; i += 1) {
        const row = primaryDataRows[i] || [];
        const fipsRaw = row[indices.fips];
        const countyRaw = row[indices.county];

        const countyName = String(countyRaw || '').trim();
        if (!countyName || countyName.toLowerCase() === 'texas') {
            continue;
        }

        const fips = String(fipsRaw || '').trim();
        if (!/^48\d{3}$/.test(fips)) {
            continue;
        }

        const additionalRow = additionalByFips.get(fips) || null;
        const uninsured = parseNumeric(row[indices.uninsuredPct]);
        const mentalHealthCoverage = Number.isFinite(uninsured) ? Math.max(0, Math.min(100, 100 - uninsured)) : null;

        parsed.push({
            year,
            fips,
            county: countyName,
            countyKey: normalizeCountyName(countyName),
            smoking: resolveMetricValue(row, indices.smoking, additionalRow, additionalIndices.smoking),
            obesity: resolveMetricValue(row, indices.obesity, additionalRow, additionalIndices.obesity),
            mentalHealth: mentalHealthCoverage,
            primaryCare: parseNumeric(row[indices.primaryCareRate]),
            prematureDeath: parseNumeric(row[indices.prematureDeath]),
            poorHealth: parseNumeric(row[indices.poorHealth]),
            teenBirth: resolveMetricValue(row, indices.teenBirth, additionalRow, additionalIndices.teenBirth)
        });
    }

    texasHealthCache.set(year, parsed);
    return parsed;
}

app.get('/api/tx-health-compare', async (req, res) => {
    const yearsParam = String(req.query.years || '').trim();
    const years = yearsParam
        ? yearsParam.split(',').map((value) => Number.parseInt(value.trim(), 10)).filter((year) => Number.isFinite(year) && TEXAS_HEALTH_FILE_URLS[year])
        : [2018, 2019, 2020, 2021, 2022, 2023, 2024];

    if (years.length === 0) {
        return res.status(400).json({ error: 'No valid years requested.' });
    }

    try {
        const datasets = await Promise.all(years.map(async (year) => {
            try {
                return await loadTexasHealthYear(year);
            } catch (error) {
                console.warn(`[tx-health-compare] Year ${year} skipped:`, error?.message || String(error));
                return [];
            }
        }));
        const records = datasets.flat();

        return res.json({
            source: 'County Health Rankings Texas Data',
            years,
            records
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to load Texas health comparison data.',
            detail: error?.message || String(error)
        });
    }
});

app.get('/api/tx-regional-employment', async (req, res) => {
    const currentYear = new Date().getFullYear();
    const requestedYearRaw = Number.parseInt(String(req.query.year || ''), 10);
    const requestedYear = Number.isFinite(requestedYearRaw) ? requestedYearRaw : currentYear;
    const maxYear = Math.min(requestedYear, currentYear);

    let lastError = null;
    for (let year = maxYear; year >= 2018; year -= 1) {
        try {
            const records = await loadTexasRegionalEmploymentYear(year);
            if (!Array.isArray(records) || records.length === 0) {
                continue;
            }

            res.set('Cache-Control', 'public, max-age=86400');
            return res.json({
                source: 'US Census ACS 5-Year',
                requestedYear,
                dataYear: year,
                records
            });
        } catch (error) {
            lastError = error;
        }
    }

    return res.status(500).json({
        error: 'Failed to load Census regional employment data for Texas counties.',
        detail: lastError?.message || 'No data available for the requested year range.'
    });
});

app.get('/api/tx-regional-demographics', async (req, res) => {
    const yearsParam = String(req.query.years || '').trim();
    const years = yearsParam
        ? yearsParam.split(',').map((value) => Number.parseInt(value.trim(), 10)).filter((year) => Number.isFinite(year) && year >= 2018)
        : [...REGIONAL_COMPARISON_YEARS];

    if (!years.length) {
        return res.status(400).json({ error: 'No valid years requested.' });
    }

    try {
        const entries = await Promise.all(years.map(async (year) => {
            try {
                return { year, recordsByLocation: await loadTexasRegionalDemographicsYear(year) };
            } catch (error) {
                console.warn(`[tx-regional-demographics] Year ${year} skipped:`, error?.message || String(error));
                return null;
            }
        }));

        const available = entries.filter(Boolean);
        const data = {};
        TX_METRO_LOCATIONS.forEach((metro) => {
            data[metro.name] = {};
        });

        available.forEach((entry) => {
            TX_METRO_LOCATIONS.forEach((metro) => {
                const record = entry.recordsByLocation?.[metro.name];
                if (record) {
                    data[metro.name][entry.year] = record;
                }
            });
        });

        return res.json({
            source: 'US Census ACS 5-Year',
            years: available.map((entry) => entry.year),
            locations: TX_METRO_LOCATIONS.map((metro) => metro.name),
            ageGroups: REGIONAL_DEMOGRAPHICS_AGE_GROUPS,
            raceGroups: REGIONAL_DEMOGRAPHICS_RACE_GROUPS,
            data
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to load Census regional demographics data.',
            detail: error?.message || String(error)
        });
    }
});

app.get('/api/tx-education-attainment', async (req, res) => {
    const yearsParam = String(req.query.years || '').trim();
    const years = yearsParam
        ? yearsParam.split(',').map((value) => Number.parseInt(value.trim(), 10)).filter((year) => Number.isFinite(year) && year >= 2018)
        : [...REGIONAL_COMPARISON_YEARS];

    if (!years.length) {
        return res.status(400).json({ error: 'No valid years requested.' });
    }

    try {
        const entries = await Promise.all(years.map(async (year) => {
            try {
                return { year, recordsByLocation: await loadTexasEducationAttainmentYear(year) };
            } catch (error) {
                console.warn(`[tx-education-attainment] Year ${year} skipped:`, error?.message || String(error));
                return null;
            }
        }));

        const available = entries.filter(Boolean);
        const data = {};
        TX_METRO_LOCATIONS.forEach((metro) => {
            data[metro.name] = {};
        });

        available.forEach((entry) => {
            TX_METRO_LOCATIONS.forEach((metro) => {
                const record = entry.recordsByLocation?.[metro.name];
                if (record) {
                    data[metro.name][entry.year] = record;
                }
            });
        });

        return res.json({
            source: 'US Census ACS 5-Year (Live API)',
            years: available.map((entry) => entry.year),
            locations: TX_METRO_LOCATIONS.map((metro) => metro.name),
            races: ['White', 'Black', 'Hispanic', 'Asian', 'Other'],
            educationLevels: ['bachelors', 'highSchool', 'noHighSchool', 'someCollege'],
            data
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to load Census education attainment data.',
            detail: error?.message || String(error)
        });
    }
});

app.get('/api/us-counties-geojson', async (req, res) => {
    try {
        if (!countiesGeoJsonCache) {
            const response = await fetch('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch county GeoJSON: ${response.status}`);
            }

            countiesGeoJsonCache = await response.json();
        }

        res.set('Cache-Control', 'public, max-age=86400');
        return res.json(countiesGeoJsonCache);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to load county GeoJSON.',
            detail: error?.message || String(error)
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
