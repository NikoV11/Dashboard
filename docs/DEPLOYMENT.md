# Deployment Guide

This dashboard has two production pieces:

1. A static frontend deployed to GitHub Pages
2. A Cloudflare Worker that proxies FRED data and serves `/api/excel-data`

## 1. Deploy the frontend to GitHub Pages

The repository now builds a standalone Pages artifact into `dist/`.

### Local build

```bash
npm install
npm run build
```

The build copies the dashboard into `dist/` and rewrites asset paths so the site can live at the repository root instead of `/public/`.

If PowerShell blocks `npm` scripts on your machine, use one of these instead:

```powershell
npm.cmd run build
```

```powershell
node .\scripts\build-pages.js
```

### Optional environment variables

If you deploy your own Worker, set these before building or in GitHub repository variables:

- `FRED_PROXY_BASE`
- `EXCEL_DATA_ENDPOINT` (optional if it is just `${FRED_PROXY_BASE}/api/excel-data`)

Example:

```bash
FRED_PROXY_BASE=https://your-worker.your-subdomain.workers.dev npm run build
```

PowerShell example:

```powershell
$env:FRED_PROXY_BASE = "https://your-worker.your-subdomain.workers.dev"
npm.cmd run build
```

### GitHub Actions deployment

The workflow at `.github/workflows/deploy.yml`:

- installs dependencies
- runs `npm run build`
- publishes `dist/` to GitHub Pages

Recommended GitHub repository variables:

- `FRED_PROXY_BASE`
- `EXCEL_DATA_ENDPOINT` (only if needed)

Once GitHub Pages is enabled for the repository, every push to `main` will redeploy the site.

## 2. Deploy the Cloudflare Worker

### Prerequisites

- Cloudflare account
- Wrangler access (`npx wrangler login`)
- FRED API key
- R2 bucket named `dashboard-excel-files`

### Set the Worker secret

```bash
npx wrangler secret put FRED_API_KEY --config worker/wrangler.toml
```

### Deploy the Worker

```bash
npm run deploy:worker
```

Or directly:

```bash
npx wrangler deploy --config worker/wrangler.toml
```

### Optional R2 fallback upload

If you want a fallback workbook in R2:

```bash
node scripts/upload-excel-to-r2.js worker/test-downloaded.xlsx
```

## 3. Connect the frontend to the Worker

If the deployed Worker URL is not `https://fred-proxy.hibbsdashboard.workers.dev`, update the GitHub repository variable:

- `FRED_PROXY_BASE=https://your-worker.workers.dev`

Then rerun the Pages workflow or push a new commit.

## 4. Smoke test

After deployment, verify:

1. GitHub Pages loads `index.html` at the site root
2. The Worker health endpoint returns JSON:
   `https://your-worker.workers.dev/health`
3. The Excel endpoint returns JSON:
   `https://your-worker.workers.dev/api/excel-data`
4. Charts load in the browser without `404` or CORS errors
