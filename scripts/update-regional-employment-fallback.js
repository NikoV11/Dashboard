#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const OUTPUT_PATH = path.resolve(__dirname, '..', 'data', 'definitions', 'regional-employment-data.js');
const START_YEAR = 2018;
const END_YEAR = new Date().getFullYear();

const PRESET_METRO_LOCATIONS = [
    {
        id: 'abilene-metro',
        name: 'Abilene, TX Metro Area',
        type: 'MSA',
        countyNames: ['Callahan', 'Jones', 'Taylor']
    },
    {
        id: 'dallas-fort-worth-metro',
        name: 'Dallas-Fort Worth-Arlington, TX Metro Area',
        type: 'MSA',
        countyNames: ['Dallas', 'Tarrant', 'Collin', 'Denton']
    },
    {
        id: 'houston-metro',
        name: 'Houston-The Woodlands-Sugar Land, TX Metro Area',
        type: 'MSA',
        countyNames: ['Harris', 'Fort Bend', 'Montgomery']
    },
    {
        id: 'austin-metro',
        name: 'Austin-Round Rock-Georgetown, TX Metro Area',
        type: 'MSA',
        countyNames: ['Travis', 'Williamson', 'Hays', 'Bastrop', 'Caldwell']
    },
    {
        id: 'el-paso-metro',
        name: 'El Paso, TX Metro Area',
        type: 'MSA',
        countyNames: ['El Paso']
    }
];

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

if (require.main === module) {
    syncRegionalEmploymentFallback().catch((error) => {
        if (fs.existsSync(OUTPUT_PATH)) {
            console.warn('[sync-regional-employment] Refresh failed, keeping existing fallback:', error.message || error);
            process.exit(0);
        }

        console.error('[sync-regional-employment] Refresh failed:', error);
        process.exit(1);
    });
}

async function syncRegionalEmploymentFallback() {
    const censusApiKey = String(process.env.CENSUS_API_KEY || '').trim();
    if (!censusApiKey) {
        throw new Error('CENSUS_API_KEY is required to refresh the regional employment fallback data.');
    }

    const years = [];
    const recordsByYear = new Map();
    const countyRecordsByYear = new Map();
    const countyNameByKey = new Map();

    for (let year = START_YEAR; year <= END_YEAR; year += 1) {
        try {
            const records = await loadTexasRegionalEmploymentYear(year, censusApiKey);
            if (!Array.isArray(records) || !records.length) {
                continue;
            }

            years.push(year);
            recordsByYear.set(year, records);

            const recordsByCountyKey = new Map();
            records.forEach((record) => {
                const countyKey = normalizeCountyName(record.county);
                if (!countyKey) {
                    return;
                }

                countyNameByKey.set(countyKey, record.county);
                recordsByCountyKey.set(countyKey, record);
            });

            countyRecordsByYear.set(year, recordsByCountyKey);
            console.log(`[sync-regional-employment] Loaded ${records.length} county records for ${year}`);
        } catch (error) {
            console.warn(`[sync-regional-employment] Skipped ${year}:`, error.message || error);
        }
    }

    if (!years.length) {
        throw new Error('No Texas regional employment records were loaded.');
    }

    const countyLocations = [...countyNameByKey.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((countyName) => ({
            id: `county-${slugify(countyName)}`,
            name: `${countyName} County, TX`,
            type: 'County',
            countyNames: [countyName]
        }));

    const data = {};

    recordsByYear.forEach((records, year) => {
        records.forEach((record) => {
            const locationId = `county-${slugify(record.county)}`;
            if (!data[locationId]) {
                data[locationId] = {};
            }

            data[locationId][year] = toEmploymentRecord(record);
        });
    });

    PRESET_METRO_LOCATIONS.forEach((metro) => {
        const metroData = {};

        years.forEach((year) => {
            const countyRecords = metro.countyNames
                .map((countyName) => countyRecordsByYear.get(year)?.get(normalizeCountyName(countyName)))
                .filter(Boolean);
            const aggregated = aggregateRegionalEmploymentRecords(countyRecords);
            if (aggregated) {
                metroData[year] = aggregated;
            }
        });

        if (Object.keys(metroData).length) {
            data[metro.id] = metroData;
        }
    });

    const payload = {
        years,
        industries: CENSUS_INDUSTRY_CONFIG.map((industry) => industry.label),
        locations: [...countyLocations, ...PRESET_METRO_LOCATIONS],
        data
    };

    writeDataDefinition(OUTPUT_PATH, 'REGIONAL_EMPLOYMENT_DATA', payload);
    console.log(`[sync-regional-employment] Wrote ${countyLocations.length} counties and ${PRESET_METRO_LOCATIONS.length} metros to ${OUTPUT_PATH}`);
}

async function loadTexasRegionalEmploymentYear(year, censusApiKey = '') {
    const subjectUrl = new URL(`https://api.census.gov/data/${year}/acs/acs5/subject`);
    subjectUrl.searchParams.set('get', CENSUS_SUBJECT_VARS.join(','));
    subjectUrl.searchParams.set('for', 'county:*');
    subjectUrl.searchParams.set('in', 'state:48');

    const earningsUrl = new URL(`https://api.census.gov/data/${year}/acs/acs5`);
    earningsUrl.searchParams.set('get', CENSUS_EARNINGS_VARS.join(','));
    earningsUrl.searchParams.set('for', 'county:*');
    earningsUrl.searchParams.set('in', 'state:48');

    const [subjectRows, earningsRows] = await Promise.all([
        fetchCensusJson(subjectUrl, censusApiKey),
        fetchCensusJson(earningsUrl, censusApiKey)
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

    return records;
}

function withCensusApiKey(url, censusApiKey = '') {
    const requestUrl = new URL(url.toString());
    if (censusApiKey && !requestUrl.searchParams.has('key')) {
        requestUrl.searchParams.set('key', censusApiKey);
    }

    return requestUrl;
}

async function fetchCensusJson(url, censusApiKey = '') {
    const response = await fetch(withCensusApiKey(url, censusApiKey).toString(), {
        headers: {
            'User-Agent': 'Hibbs-Dashboard-Refresh/1.0'
        }
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Census request failed (${response.status}): ${body.slice(0, 240)}`);
    }

    return response.json();
}

function aggregateRegionalEmploymentRecords(records) {
    if (!Array.isArray(records) || !records.length) {
        return null;
    }

    const average = (values) => {
        const clean = values.filter((value) => Number.isFinite(value));
        if (!clean.length) {
            return null;
        }

        return clean.reduce((sum, value) => sum + value, 0) / clean.length;
    };

    const industryEmployment = {};
    const weeklyWages = {};

    CENSUS_INDUSTRY_CONFIG.forEach((industry) => {
        const label = industry.label;
        const employmentTotal = records.reduce((sum, record) => {
            const value = Number(record?.industryEmployment?.[label]);
            return sum + (Number.isFinite(value) ? value : 0);
        }, 0);

        industryEmployment[label] = employmentTotal > 0 ? Math.round(employmentTotal) : null;

        const weightedWage = records.reduce((state, record) => {
            const employment = Number(record?.industryEmployment?.[label]);
            const wage = Number(record?.weeklyWages?.[label]);

            if (Number.isFinite(employment) && employment > 0 && Number.isFinite(wage)) {
                state.weighted += wage * employment;
                state.weight += employment;
                return state;
            }

            if (Number.isFinite(wage)) {
                state.simple += wage;
                state.simpleCount += 1;
            }

            return state;
        }, {
            weighted: 0,
            weight: 0,
            simple: 0,
            simpleCount: 0
        });

        if (weightedWage.weight > 0) {
            weeklyWages[label] = Math.round(weightedWage.weighted / weightedWage.weight);
        } else if (weightedWage.simpleCount > 0) {
            weeklyWages[label] = Math.round(weightedWage.simple / weightedWage.simpleCount);
        } else {
            weeklyWages[label] = null;
        }
    });

    return {
        unemploymentRate: average(records.map((record) => Number(record?.unemploymentRate))),
        laborForceParticipationRate: average(records.map((record) => Number(record?.laborForceParticipationRate))),
        weeklyWages,
        industryEmployment
    };
}

function toEmploymentRecord(record) {
    return {
        unemploymentRate: Number.isFinite(record?.unemploymentRate) ? record.unemploymentRate : null,
        laborForceParticipationRate: Number.isFinite(record?.laborForceParticipationRate) ? record.laborForceParticipationRate : null,
        weeklyWages: { ...record.weeklyWages },
        industryEmployment: { ...record.industryEmployment }
    };
}

function writeDataDefinition(targetPath, variableName, payload) {
    const contents = [
        '/**',
        ' * Regional employment comparison dataset for Texas counties and metro areas.',
        ' * Metrics include unemployment rate, labor force participation rate,',
        ' * annual average weekly wages by industry, and annual average employment by industry.',
        ' */',
        `const ${variableName} = ${JSON.stringify(payload, null, 4)};`,
        '',
        "if (typeof window !== 'undefined') {",
        `    window.${variableName} = ${variableName};`,
        '}',
        '',
        "if (typeof module !== 'undefined' && module.exports) {",
        `    module.exports = { ${variableName} };`,
        '}',
        ''
    ].join('\n');

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, contents, 'utf8');
}

function normalizeCountyName(name) {
    return String(name || '').trim().toLowerCase();
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function parseTexasCountyNameFromCensus(name) {
    return String(name || '')
        .replace(/,\s*Texas$/i, '')
        .replace(/\s+County$/i, '')
        .trim();
}

function parseCensusNumeric(value) {
    const raw = String(value ?? '').trim();
    if (!raw || raw === '-666666666' || raw === 'null') {
        return null;
    }

    const parsed = Number.parseFloat(raw.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
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

    for (let index = 0; index < earningsCodes.length; index += 1) {
        const annual = readCensusValue(headers, earningsRow, earningsCodes[index]);
        if (!Number.isFinite(annual)) {
            continue;
        }

        simpleAnnualTotal += annual;
        simpleCount += 1;

        const employmentCode = employmentCodes[index];
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

module.exports = {
    syncRegionalEmploymentFallback
};
