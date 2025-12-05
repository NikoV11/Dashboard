# FRED Dashboard - Local Server Setup

Your dashboard is now configured to fetch live FRED data from a local server. This eliminates all CORS issues and ensures reliable data fetching.

## Quick Start

Choose one of the methods below based on what's installed on your system:

### Option 1: Node.js Server (Recommended)

**Prerequisites:** Node.js installed

1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org
   - Choose the LTS (Long-Term Support) version
   - During installation, make sure to check ✓ "Add to PATH"
   - After installation, restart your terminal

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   - **Windows:** Double-click `start-server.bat`
   - **Mac/Linux:** Run `bash start-server.sh`
   - Or manually run: `npm start`

4. **Open in browser:**
   - Navigate to: http://localhost:3000
   - You should see the dashboard with live FRED data

### Option 2: Python Server

**Prerequisites:** Python 3 installed

1. **Install Python 3** (if not already installed):
   - Download from: https://www.python.org/downloads
   - Make sure to check ✓ "Add Python to PATH" during installation
   - After installation, restart your terminal

2. **Start the server:**
   - **Windows:** Double-click `start-server-python.bat`
   - **Mac/Linux:** Run `python3 server.py`

3. **Open in browser:**
   - Navigate to: http://localhost:3000
   - You should see the dashboard with live FRED data

### Option 3: Quick Python HTTP Server (No Dependencies)

If you need a quick server without setup:

```bash
# Windows
python -m http.server 3000

# Mac/Linux
python3 -m http.server 3000
```

**Note:** This won't handle the API endpoint, so you'll see sample data instead of live data.

---

## How It Works

The local server:
- ✅ Serves your dashboard files (index.html, styles.css, dashboard.js)
- ✅ Provides a `/api/fred/:seriesId` endpoint that fetches data from FRED API
- ✅ Adds proper CORS headers so the dashboard can fetch from the endpoint
- ✅ Uses your API key: `60702495b0f5bcf665cfe1db3ae9dbe0`

## Troubleshooting

### "npm install" fails
- Make sure Node.js is installed: `node --version`
- If not installed, download from https://nodejs.org
- After installing, restart your terminal

### "Port 3000 already in use"
- Another application is using port 3000
- Kill the process or change the port in `server.js` or `server.py`

### Dashboard shows "Sample Data" instead of "Live API"
- Check browser console (F12) for error messages
- Make sure the server is running: http://localhost:3000/api/health should return `{"status":"ok",...}`
- Check that your internet connection works

### Server won't start
- Make sure you're in the Dashboard folder
- Try running the command manually (not just double-clicking the .bat)
- Check for error messages in the terminal

---

## File Structure

```
Dashboard/
├── index.html           # Main dashboard UI
├── styles.css          # Responsive styling
├── dashboard.js        # Frontend logic (updated for local server)
├── server.js           # Node.js server
├── server.py           # Python server (alternative)
├── start-server.bat    # Windows startup script
├── start-server.sh     # Mac/Linux startup script
└── README.md           # Documentation
```

---

## Configuration

### Change the port
Edit the port number in:
- `server.js`: Line 6 - `const PORT = 3000;`
- `server.py`: Line 11 - `PORT = 3000`
- `dashboard.js`: Line 3 - `const FRED_API_URL = 'http://localhost:3000/api/fred';`

### Update the API key
The API key is configured in:
- `server.js`: Line 7
- `server.py`: Line 9

---

## What Changed

The dashboard has been updated to:
1. **Removed:** CORS proxy attempts (unreliable)
2. **Added:** Local server endpoint at `http://localhost:3000/api/fred`
3. **Result:** Live FRED data fetching now works reliably!

---

## Next Steps

1. Install Node.js or Python (if not already installed)
2. Run the startup script or manually start the server
3. Open http://localhost:3000 in your browser
4. Watch the live data update on the charts!

---

## Support

If you encounter issues:
1. Check the browser console (F12 → Console tab)
2. Check the server terminal output for error messages
3. Verify your internet connection
4. Make sure port 3000 is available
5. Try restarting the server

Enjoy your FRED Dashboard! 📊
