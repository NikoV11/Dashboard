const path = require('path');
const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
