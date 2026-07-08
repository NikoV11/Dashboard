#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const HEALTH_OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'data', 'tx-health-compare.json');
const GEOJSON_OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'data', 'texas-counties-geojson.json');
const GEOJSON_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';

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

main().catch((error) => {
    const hasFallbacks = fs.existsSync(HEALTH_OUTPUT_PATH) && fs.existsSync(GEOJSON_OUTPUT_PATH);
    if (hasFallbacks) {
        console.warn('[sync-texas-compare] Refresh failed, keeping existing fallback files:', error.message || error);
        process.exit(0);
    }

    console.error('[sync-texas-compare] Refresh failed:', error);
    process.exit(1);
});

async function main() {
    const years = Object.keys(TEXAS_HEALTH_FILE_URLS)
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value))
        .sort((a, b) => a - b);

    const records = [];
    for (const year of years) {
        try {
            const dataset = await loadTexasHealthYear(year);
            records.push(...dataset);
            console.log(`[sync-texas-compare] Loaded ${dataset.length} county records for ${year}`);
        } catch (error) {
            console.warn(`[sync-texas-compare] Skipped ${year}:`, error.message || error);
        }
    }

    if (!records.length) {
        throw new Error('No Texas health comparison records were loaded.');
    }

    const geojson = await loadTexasCountyGeoJson();
    if (!Array.isArray(geojson.features) || !geojson.features.length) {
        throw new Error('Texas county GeoJSON did not include any features.');
    }

    writeJson(HEALTH_OUTPUT_PATH, {
        source: 'County Health Rankings Texas Data',
        years,
        records
    });

    writeJson(GEOJSON_OUTPUT_PATH, geojson);

    console.log(`[sync-texas-compare] Wrote ${records.length} health records to ${HEALTH_OUTPUT_PATH}`);
    console.log(`[sync-texas-compare] Wrote ${geojson.features.length} Texas county features to ${GEOJSON_OUTPUT_PATH}`);
}

async function loadTexasHealthYear(year) {
    const url = TEXAS_HEALTH_FILE_URLS[year];
    if (!url) {
        return [];
    }

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Hibbs-Dashboard-Refresh/1.0'
        }
    });
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
    for (const row of primaryDataRows) {
        const countyName = String(row?.[indices.county] || '').trim();
        if (!countyName || countyName.toLowerCase() === 'texas') {
            continue;
        }

        const fips = String(row?.[indices.fips] || '').trim();
        if (!/^48\d{3}$/.test(fips)) {
            continue;
        }

        const additionalRow = additionalByFips.get(fips) || null;
        const uninsured = parseNumeric(row?.[indices.uninsuredPct]);
        const mentalHealthCoverage = Number.isFinite(uninsured)
            ? Math.max(0, Math.min(100, 100 - uninsured))
            : null;

        parsed.push({
            year,
            fips,
            county: countyName,
            countyKey: normalizeCountyName(countyName),
            smoking: resolveMetricValue(row, indices.smoking, additionalRow, additionalIndices.smoking),
            obesity: resolveMetricValue(row, indices.obesity, additionalRow, additionalIndices.obesity),
            mentalHealth: mentalHealthCoverage,
            primaryCare: parseNumeric(row?.[indices.primaryCareRate]),
            prematureDeath: parseNumeric(row?.[indices.prematureDeath]),
            poorHealth: parseNumeric(row?.[indices.poorHealth]),
            teenBirth: resolveMetricValue(row, indices.teenBirth, additionalRow, additionalIndices.teenBirth)
        });
    }

    return parsed;
}

async function loadTexasCountyGeoJson() {
    const response = await fetch(GEOJSON_URL, {
        headers: {
            'User-Agent': 'Hibbs-Dashboard-Refresh/1.0'
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch county GeoJSON: ${response.status}`);
    }

    const payload = await response.json();
    const features = Array.isArray(payload?.features)
        ? payload.features.filter((feature) => String(feature?.id || '').startsWith('48'))
        : [];

    return {
        type: payload?.type || 'FeatureCollection',
        features
    };
}

function writeJson(targetPath, payload) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function parseNumeric(value) {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized || normalized === 'x' || normalized === 'na' || normalized === 'n/a') {
        return null;
    }

    const parsed = Number.parseFloat(String(value).replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
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
        if (idx >= 0) {
            return idx;
        }
    }

    return -1;
}

function findHeaderRowIndex(rows) {
    const maxScanRows = Math.min(Array.isArray(rows) ? rows.length : 0, 12);
    for (let index = 0; index < maxScanRows; index += 1) {
        const row = rows[index] || [];
        const hasFips = findColumnIndex(row, 'FIPS') >= 0;
        const hasCounty = findColumnIndex(row, 'County') >= 0;
        if (hasFips && hasCounty) {
            return index;
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
    if (preferred) {
        return preferred;
    }

    const ranked = workbook.SheetNames.find((name) => /ranked measure data/i.test(name));
    if (ranked) {
        return ranked;
    }

    return workbook.SheetNames[0];
}
