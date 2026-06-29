const path = require('path');
const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const XLSX = require('xlsx');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TEXAS_ALL_FUNDS_XLSX_URL = process.env.TEXAS_ALL_FUNDS_XLSX_URL || 'https://comptroller.texas.gov/transparency/revenue/watch/all-funds/data/all-funds-historical.xlsx';
const TEXAS_ALL_FUNDS_PAGE_URL = process.env.TEXAS_ALL_FUNDS_PAGE_URL || 'https://comptroller.texas.gov/transparency/revenue/watch/all-funds/';
const FISCAL_MONTH_ORDER = [
    'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August'
];

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

app.get('/api/excel-data', async (req, res) => {
    try {
        const payload = await buildTexasRevenuePayload();

        res.set('Cache-Control', 'public, max-age=3600');
        res.set('X-Excel-Source', 'official-history-plus-live-current-fy');
        return res.json(payload);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to load Texas revenue workbook',
            detail: error?.message || String(error)
        });
    }
});

async function buildTexasRevenuePayload() {
    const historyResponse = await fetch(TEXAS_ALL_FUNDS_XLSX_URL);

    if (!historyResponse.ok) {
        throw new Error(`Historical workbook request failed with ${historyResponse.status}`);
    }

    const historyBuffer = await historyResponse.arrayBuffer();
    const workbook = XLSX.read(historyBuffer, { type: 'array' });
    const payload = {};

    workbook.SheetNames.forEach((sheetName) => {
        payload[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    });

    const currentPageResponse = await fetch(TEXAS_ALL_FUNDS_PAGE_URL);
    if (!currentPageResponse.ok) {
        throw new Error(`Current revenue page request failed with ${currentPageResponse.status}`);
    }

    const currentPageHtml = await currentPageResponse.text();
    const currentFiscalSheet = buildCurrentFiscalSheet(currentPageHtml);
    payload[currentFiscalSheet.sheetName] = currentFiscalSheet.rows;

    return payload;
}

function buildCurrentFiscalSheet(html) {
    const fiscalYearMatch = html.match(/Fiscal\s+(\d{4})/i);
    if (!fiscalYearMatch) {
        throw new Error('Unable to determine current fiscal year from the revenue page');
    }

    const currentFiscalYear = fiscalYearMatch[1];
    const rows = getCurrentFiscalTableRows(html);
    const monthColumnCount = Math.max(0, Math.min(FISCAL_MONTH_ORDER.length, (rows[0]?.length || 0) - 4));

    const sheetKey = `Historical All Funds (Excluding Trusts) Revenue Fiscal ${currentFiscalYear}`;
    const payloadRows = [];
    payloadRows.push({ [sheetKey]: 'Tax Collections' });

    const headerRow = { [sheetKey]: 'Tax Category' };
    FISCAL_MONTH_ORDER.forEach((month, index) => {
        headerRow[getSheetColumnKey(index)] = month;
    });
    headerRow.__EMPTY_12 = 'Total';
    headerRow.__EMPTY_13 = 'CRE Fiscal Year Estimate';
    payloadRows.push(headerRow);

    rows.slice(1).forEach((row) => {
        if (!Array.isArray(row) || typeof row[0] !== 'string') return;

        const label = normalizeCurrentTableLabel(row[0]);
        if (!label || label === 'Percentage Change') return;

        const payloadRow = { [sheetKey]: label };
        FISCAL_MONTH_ORDER.forEach((_, index) => {
            payloadRow[getSheetColumnKey(index)] = index < monthColumnCount
                ? coerceNumber(row[index + 1])
                : 0;
        });
        payloadRow.__EMPTY_12 = coerceNumber(row[monthColumnCount + 1]);
        payloadRow.__EMPTY_13 = coerceNumber(row[monthColumnCount + 3]);
        payloadRows.push(payloadRow);
    });

    return {
        sheetName: `FY ${currentFiscalYear}`,
        rows: payloadRows
    };
}

function getCurrentFiscalTableRows(html) {
    const tablesWorkbook = XLSX.read(html, { type: 'string' });

    for (const sheetName of tablesWorkbook.SheetNames) {
        const rows = XLSX.utils.sheet_to_json(tablesWorkbook.Sheets[sheetName], { header: 1, raw: true });
        const firstCell = normalizeCurrentTableLabel(rows[0]?.[0]);

        if (firstCell === 'Tax Collections by Major Tax') {
            return rows;
        }
    }

    throw new Error('Tax collections table was not found on the live revenue page');
}

function getSheetColumnKey(index) {
    return index === 0 ? '__EMPTY' : `__EMPTY_${index}`;
}

function normalizeCurrentTableLabel(label) {
    if (typeof label !== 'string') return '';
    return label.replace(/\s+/g, ' ').replace(/\d+$/u, '').trim();
}

function coerceNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value.replace(/,/g, '').trim());
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
