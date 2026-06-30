#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const CURRENT_FISCAL_URL = process.env.CURRENT_FISCAL_URL || 'https://comptroller.texas.gov/transparency/revenue/watch/all-funds/';
const CURRENT_FISCAL_HTML_FILE = process.env.CURRENT_FISCAL_HTML_FILE;
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'data', 'current-fiscal-year-tax-collections.json');
const FISCAL_MONTH_ORDER = [
    'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August'
];

async function syncCurrentFiscalFallback() {
    const html = CURRENT_FISCAL_HTML_FILE
        ? fs.readFileSync(path.resolve(CURRENT_FISCAL_HTML_FILE), 'utf8')
        : await fetchCurrentFiscalHtml();

    const payload = buildCurrentFiscalPayload(html);
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

    const lastReportedMonthIndex = getLastReportedMonthIndex(payload.rows);
    const lastReportedMonth = lastReportedMonthIndex >= 0
        ? FISCAL_MONTH_ORDER[lastReportedMonthIndex]
        : 'unknown month';

    console.log(`[sync-current-fiscal] Wrote ${payload.sheetName} fallback through ${lastReportedMonth} to ${OUTPUT_PATH}`);
}

if (require.main === module) {
    syncCurrentFiscalFallback().catch((error) => {
        if (fs.existsSync(OUTPUT_PATH)) {
            console.warn('[sync-current-fiscal] Refresh failed, keeping existing fallback:', error.message || error);
            process.exit(0);
        }

        console.error('[sync-current-fiscal] Refresh failed:', error);
        process.exit(1);
    });
}

async function fetchCurrentFiscalHtml() {
    if (typeof fetch !== 'function') {
        throw new Error('Global fetch is unavailable in this Node runtime');
    }

    const response = await fetch(CURRENT_FISCAL_URL, {
        headers: {
            'User-Agent': 'Hibbs-Dashboard-Refresh/1.0'
        }
    });

    if (!response.ok) {
        throw new Error(`Current revenue page request failed with ${response.status}`);
    }

    return response.text();
}

function buildCurrentFiscalPayload(html) {
    const fiscalYearMatch = html.match(/Fiscal\s+(\d{4})/i);
    if (!fiscalYearMatch) {
        throw new Error('Unable to determine current fiscal year from the revenue page');
    }

    const currentFiscalYear = fiscalYearMatch[1];
    const rows = getTaxCollectionRows(html);
    const sourceHeaderRow = rows[0] || [];
    const totalHeaderIndex = sourceHeaderRow.findIndex((value) => normalizeCell(value).toLowerCase() === 'total');
    const monthColumnCount = totalHeaderIndex > 1
        ? Math.min(FISCAL_MONTH_ORDER.length, totalHeaderIndex - 1)
        : FISCAL_MONTH_ORDER.length;

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

function getTaxCollectionRows(html) {
    const workbook = XLSX.read(html, { type: 'string' });

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        const firstCell = normalizeCell(rows[0]?.[0]);

        if (firstCell === 'Tax Collections by Major Tax') {
            return rows;
        }
    }

    throw new Error('Tax collections table was not found on the live revenue page');
}

function getLastReportedMonthIndex(rows) {
    const headerRow = Array.isArray(rows)
        ? rows.find((row) => normalizeCell(Object.values(row || {})[0]).includes('Tax Category'))
        : null;

    if (!headerRow) return -1;

    const monthKeyMap = new Map();
    Object.entries(headerRow).forEach(([key, value]) => {
        const label = normalizeCell(value);
        if (FISCAL_MONTH_ORDER.includes(label)) {
            monthKeyMap.set(label, key);
        }
    });

    let lastReportedMonthIndex = -1;
    rows.forEach((row) => {
        const label = normalizeCell(Object.values(row || {})[0]);
        if (!label || label === 'Tax Collections' || label === 'Tax Category') return;

        FISCAL_MONTH_ORDER.forEach((month, index) => {
            const key = monthKeyMap.get(month);
            if (!key) return;

            if (coerceNumber(row[key]) !== 0) {
                lastReportedMonthIndex = Math.max(lastReportedMonthIndex, index);
            }
        });
    });

    return lastReportedMonthIndex;
}

function getSheetColumnKey(index) {
    return index === 0 ? '__EMPTY' : `__EMPTY_${index}`;
}

function normalizeCell(value) {
    return String(value || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeCurrentTableLabel(label) {
    if (typeof label !== 'string') return '';
    return normalizeCell(label).replace(/\d+$/u, '').trim();
}

function coerceNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;

    const parsed = Number(
        String(value || '')
            .replace(/,/g, '')
            .replace(/\$/g, '')
            .replace(/%/g, '')
            .trim()
    );

    return Number.isFinite(parsed) ? parsed : 0;
}

module.exports = {
    syncCurrentFiscalFallback,
    buildCurrentFiscalPayload
};
