# FRED Dashboard - Cache Clearing Guide

If you see errors about `http://localhost:3000` when the code should be using `/.netlify/functions/fred-proxy`, your browser has cached the old code.

## Clear Browser Cache

### Chrome / Edge / Brave:
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "All time" for Time range
3. Check "Cached images and files"
4. Click "Clear data"
5. Refresh the page with `Ctrl + F5` or `Cmd + Shift + R`

### Firefox:
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Click "Clear Now"
3. Refresh with `Ctrl + F5`

### Safari:
1. Menu → Develop → Empty Web Storage
2. Menu → Develop → Empty Caches
3. Refresh with `Cmd + Shift + R`

## Quick Fix - Hard Refresh

The fastest way:
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

This forces the browser to reload all assets and ignore cache.

## If Still Not Working

Open DevTools (F12) and check:
1. Go to the Console tab
2. Look at the first few log lines
3. You should see: `Attempting to fetch from Netlify function: /.netlify/functions/fred-proxy?seriesId=GDPC1`
4. If you still see `localhost:3000`, the cache wasn't fully cleared

Try:
1. Close the browser completely
2. Reopen and navigate to your Netlify URL
3. If running locally, clear your browser data for `localhost:3000`
