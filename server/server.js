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
