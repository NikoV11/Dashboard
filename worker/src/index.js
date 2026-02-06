import * as XLSX from 'xlsx';

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

        if (!env.FRED_API_KEY) {
            return new Response('Server misconfigured: missing FRED_API_KEY', { status: 500 });
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
        if (!env.EXCEL_BUCKET) {
            return new Response(
                JSON.stringify({ error: 'R2 bucket not configured' }),
                { status: 500, headers: corsHeaders }
            );
        }

        // Get the Excel file from R2
        const fileObject = await env.EXCEL_BUCKET.get('dashboard-data.xlsx');

        if (!fileObject) {
            return new Response(
                JSON.stringify({ error: 'Excel file not found in R2' }),
                { status: 404, headers: corsHeaders }
            );
        }

        // Read file as buffer
        const buffer = await fileObject.arrayBuffer();

        // Parse Excel workbook
        const workbook = XLSX.read(buffer, { type: 'array' });

        // Convert all sheets to JSON
        const result = {};
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        }

        return new Response(JSON.stringify(result, null, 2), {
            status: 200,
            headers: corsHeaders
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
