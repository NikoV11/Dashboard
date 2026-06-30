#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { syncCurrentFiscalFallback } = require('./update-current-fiscal-fallback');
const { syncRegionalEmploymentFallback } = require('./update-regional-employment-fallback');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const sourceCssPath = path.join(rootDir, 'src', 'css', 'styles.css');
const sourceJsPath = path.join(rootDir, 'src', 'js', 'dashboard.js');
const publicCssPath = path.join(publicDir, 'styles.css');
const imagesDir = path.join(rootDir, 'images');
const dataDefinitionsDir = path.join(rootDir, 'data', 'definitions');

const defaultFredProxyBase = 'https://fred-proxy.hibbsdashboard.workers.dev';
const fredProxyBase = normalizeUrl(process.env.FRED_PROXY_BASE || defaultFredProxyBase);
const excelDataEndpoint = normalizeUrl(
    process.env.EXCEL_DATA_ENDPOINT || `${fredProxyBase}/api/excel-data`
);
const fredProxyOrigin = getUrlOrigin(fredProxyBase);
const excelDataOrigin = getUrlOrigin(excelDataEndpoint);
const connectOrigins = Array.from(new Set([fredProxyOrigin, excelDataOrigin])).join(' ');

if (require.main === module) {
    buildPagesSite().catch((error) => {
        console.error('[build-pages] Build failed:', error);
        process.exit(1);
    });
}

async function buildPagesSite() {
    try {
        await syncCurrentFiscalFallback();
    } catch (error) {
        console.warn('[build-pages] Fiscal fallback refresh skipped:', error?.message || error);
    }

    try {
        await syncRegionalEmploymentFallback();
    } catch (error) {
        console.warn('[build-pages] Regional employment fallback refresh skipped:', error?.message || error);
    }

    fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });

    copyDirectory(publicDir, distDir);
    copyDirectory(imagesDir, path.join(distDir, 'images'));
    copyDirectory(dataDefinitionsDir, path.join(distDir, 'data', 'definitions'));

    fs.mkdirSync(path.join(distDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(distDir, 'js'), { recursive: true });

    writeFile(
        path.join(distDir, 'css', 'styles.css'),
        rewriteStylesheet(fs.readFileSync(sourceCssPath, 'utf8'), '../images/')
    );
    writeFile(
        path.join(distDir, 'styles.css'),
        rewriteStylesheet(fs.readFileSync(publicCssPath, 'utf8'), './images/')
    );
    fs.copyFileSync(sourceJsPath, path.join(distDir, 'js', 'dashboard.js'));

    const publicIndex = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
    writeFile(path.join(distDir, 'index.html'), rewriteIndexHtml(publicIndex));
    writeFile(path.join(distDir, '.nojekyll'), '');

    console.log(`Built GitHub Pages site in ${distDir}`);
    console.log(`FRED proxy base: ${fredProxyBase}`);
    console.log(`Excel data endpoint: ${excelDataEndpoint}`);
}

function copyDirectory(source, destination) {
    fs.cpSync(source, destination, {
        recursive: true,
        force: true
    });
}

function writeFile(targetPath, contents) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, contents, 'utf8');
}

function rewriteIndexHtml(html) {
    return html
        .replace(
            /(<meta\s+name="fred-proxy-base"\s+content=")[^"]*(")/,
            `$1${fredProxyBase}$2`
        )
        .replace(
            /(<meta\s+name="excel-data-endpoint"\s+content=")[^"]*(")/,
            `$1${excelDataEndpoint}$2`
        )
        .replace(
            /https:\/\/fred-proxy\.hibbsdashboard\.workers\.dev(?= https:\/\/data\.texas\.gov)/g,
            connectOrigins
        )
        .replace(
            /(<link\s+rel="preconnect"\s+href=")https:\/\/fred-proxy\.hibbsdashboard\.workers\.dev(")/,
            `$1${fredProxyOrigin}$2`
        )
        .replace(/\.\.\/src\/css\/styles\.css/g, './css/styles.css')
        .replace(/\.\.\/images\//g, './images/')
        .replace(/\.\.\/data\/definitions\//g, './data/definitions/')
        .replace(/\.\.\/src\/js\/dashboard\.js(\?v=\d+)?/g, './js/dashboard.js$1');
}

function rewriteStylesheet(css, imagePathPrefix) {
    return css.replace(/\.\.\/\.\.\/images\//g, imagePathPrefix);
}

function normalizeUrl(url) {
    return String(url).trim().replace(/\/+$/, '');
}

function getUrlOrigin(url) {
    return new URL(url).origin;
}

module.exports = {
    buildPagesSite,
    distDir,
    rootDir
};
