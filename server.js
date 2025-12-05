const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = 3000;
const FRED_API_KEY = '60702495b0f5bcf665cfe1db3ae9dbe0';
const FRED_API_URL = 'https://api.stlouisfed.org/fred/series/data';

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoint to fetch FRED data
    if (pathname.startsWith('/api/fred/')) {
        const seriesId = pathname.replace('/api/fred/', '');
        
        if (!seriesId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Series ID required' }));
            return;
        }

        const apiUrl = `${FRED_API_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
        
        console.log(`[${new Date().toISOString()}] Fetching ${seriesId}...`);
        
        https.get(apiUrl, (fredRes) => {
            let data = '';
            
            fredRes.on('data', (chunk) => {
                data += chunk;
            });
            
            fredRes.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(parsedData));
                    console.log(`[${new Date().toISOString()}] ✓ Successfully fetched ${seriesId}`);
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Error parsing FRED response:`, error.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to parse FRED API response', details: error.message }));
                }
            });
        }).on('error', (error) => {
            console.error(`[${new Date().toISOString()}] Error fetching from FRED:`, error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch from FRED API', details: error.message }));
        });

        return;
    }

    // Health check endpoint
    if (pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data, 'utf-8');
    });
});

server.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 FRED Dashboard Server Started`);
    console.log(`========================================`);
    console.log(`📍 Local URL: http://localhost:${PORT}`);
    console.log(`📊 Open your browser and navigate to:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n🔌 API Endpoint: http://localhost:${PORT}/api/fred/:seriesId`);
    console.log(`   Example: http://localhost:${PORT}/api/fred/GDPC1`);
    console.log(`\n✅ CORS Enabled - Live data fetching enabled!`);
    console.log(`========================================`);
});

