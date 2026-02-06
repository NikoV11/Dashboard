export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        if (request.method !== 'GET') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        if (!env.FRED_API_KEY) {
            return new Response('Server misconfigured: missing FRED_API_KEY', { status: 500 });
        }

        const url = new URL(request.url);

        if (url.pathname === '/' || url.pathname === '/health') {
            return new Response(
                JSON.stringify({
                    ok: true,
                    message: 'FRED proxy is running. Use /fred/series/observations with FRED query params.'
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            );
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
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            );
        }
    }
};
