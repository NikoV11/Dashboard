import * as XLSX from 'xlsx';

const DEFAULT_TEXAS_ALL_FUNDS_XLSX_URL = 'https://comptroller.texas.gov/transparency/revenue/watch/all-funds/data/all-funds-historical.xlsx';
const DEFAULT_TEXAS_ALL_FUNDS_PAGE_URL = 'https://comptroller.texas.gov/transparency/revenue/watch/all-funds/';
const FISCAL_MONTH_ORDER = [
    'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August'
];

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        if (request.method !== 'GET' && request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders });
        }

        const url = new URL(request.url);

        if (url.pathname === '/' || url.pathname === '/health') {
            return new Response(
                JSON.stringify({
                    ok: true,
                    message: 'FRED proxy is running. Use /fred/series/observations with FRED query params.',
                    endpoints: ['/api/excel-data']
                }),
                {
                    status: 200,
                    headers: corsHeaders
                }
            );
        }

        // Excel data endpoint
        if (url.pathname === '/api/excel-data') {
            return handleExcelData(request, env);
        }

        if (!url.pathname.endsWith('/fred/series/observations')) {
            return new Response('Not Found', { status: 404 });
        }

        if (!env.FRED_API_KEY) {
            return new Response('Server misconfigured: missing FRED_API_KEY', { status: 500 });
        }

        const target = new URL('https://api.stlouisfed.org/fred/series/observations');

        url.searchParams.forEach((value, key) => {
            if (value) {
                target.searchParams.set(key, value);
            }
        });

        if (!target.searchParams.has('file_type')) {
            target.searchParams.set('file_type', 'json');
        }

        if (!target.searchParams.has('limit')) {
            target.searchParams.set('limit', '10000');
        }

        target.searchParams.set('api_key', env.FRED_API_KEY);

        try {
            const response = await fetch(target.toString());

            const headers = new Headers(response.headers);
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Cache-Control', 'public, max-age=600');
            headers.set('Content-Type', 'application/json');

            return new Response(response.body, {
                status: response.status,
                headers
            });
        } catch (error) {
            return new Response(
                JSON.stringify({
                    error: 'Failed to reach FRED API',
                    detail: error?.message || String(error)
                }),
                {
                    status: 500,
                    headers: corsHeaders
                }
            );
        }
    }
};

async function handleExcelData(request, env) {
    try {
        const { payload, source } = await buildTexasRevenuePayload(env);

        return new Response(JSON.stringify(payload, null, 2), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Cache-Control': 'public, max-age=3600',
                'X-Excel-Source': source
            }
        });
    } catch (error) {
        console.error('Excel processing error:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to process Excel file',
                detail: error?.message || String(error)
            }),
            { status: 500, headers: corsHeaders }
        );
    }
}

async function buildTexasRevenuePayload(env) {
    const { buffer, source } = await loadExcelBuffer(env);
    const workbook = XLSX.read(buffer, { type: 'array' });
    const payload = {};

    for (const sheetName of workbook.SheetNames) {
        payload[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    try {
        const currentFiscalSheet = await loadCurrentFiscalSheet(env);
        payload[currentFiscalSheet.sheetName] = currentFiscalSheet.rows;
        return {
            payload,
            source: `${source}+live-current-fy`
        };
    } catch (error) {
        console.warn('Live current fiscal year overlay failed:', error);
        return { payload, source };
    }
}

async function loadExcelBuffer(env) {
    const workbookUrl = env.TEXAS_ALL_FUNDS_XLSX_URL || DEFAULT_TEXAS_ALL_FUNDS_XLSX_URL;

    try {
        const response = await fetch(workbookUrl, {
            cf: {
                cacheEverything: true,
                cacheTtl: 3600
            }
        });

        if (!response.ok) {
            throw new Error(`Official workbook request failed with ${response.status}`);
        }

        return {
            buffer: await response.arrayBuffer(),
            source: 'official-texas-comptroller'
        };
    } catch (error) {
        console.warn('Official workbook fetch failed, falling back to R2:', error);

        if (!env.EXCEL_BUCKET) {
            throw new Error(`Official workbook fetch failed and R2 bucket is not configured: ${error?.message || String(error)}`);
        }

        const fileObject = await env.EXCEL_BUCKET.get('dashboard-data.xlsx');
        if (!fileObject) {
            throw new Error('Official workbook fetch failed and Excel file was not found in R2');
        }

        return {
            buffer: await fileObject.arrayBuffer(),
            source: 'r2-fallback'
        };
    }
}

async function loadCurrentFiscalSheet(env) {
    const pageUrl = env.TEXAS_ALL_FUNDS_PAGE_URL || DEFAULT_TEXAS_ALL_FUNDS_PAGE_URL;
    const response = await fetch(pageUrl, {
        cf: {
            cacheEverything: true,
            cacheTtl: 3600
        }
    });

    if (!response.ok) {
        throw new Error(`Current revenue page request failed with ${response.status}`);
    }

    const html = await response.text();
    return buildCurrentFiscalSheet(html);
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
