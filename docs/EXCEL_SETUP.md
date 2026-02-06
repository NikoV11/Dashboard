# Excel File Loading Setup for Dashboard

## ✅ What's Been Added

### 1. **Worker Configuration** (`worker/wrangler.toml`)
- R2 bucket binding: `EXCEL_BUCKET` → `dashboard-excel-files`
- Requires R2 to be enabled on your Cloudflare account

### 2. **Worker Endpoint** (`worker/src/index.js`)
- **GET /api/excel-data** - Fetches Excel file from R2, reads all sheets, returns JSON
- **CORS Support** - Allows requests from any origin
- **Error Handling** - Graceful fallbacks for missing files or parsing errors
- **Dependencies** - Uses `xlsx` package for Excel parsing

### 3. **Frontend Loader** (`public/js/excel-loader.js`)
- `ExcelDataLoader.load()` - Fetches and caches all Excel sheets
- `ExcelDataLoader.getSheet(name)` - Get specific sheet data
- Helper functions for creating Chart.js charts from Excel data
- 5-minute client-side cache to reduce API calls

### 4. **Upload Script** (`scripts/upload-excel-to-r2.js`)
- Node.js script to upload Excel files to R2

---

## 📋 Setup Steps

### Step 1: Enable R2 on Cloudflare
1. Go to **Cloudflare Dashboard** → **R2**
2. Click **Create Bucket**
3. Name: `dashboard-excel-files`
4. Choose region (e.g., `US`)
5. Create bucket

### Step 2: Deploy Worker
```powershell
cd C:\Users\ps3zo\Desktop\Dashboard\worker
wrangler deploy
```

### Step 3: Upload Your Excel File
Create a test Excel file with sheets (e.g., `Sales`, `Metrics`) and run:

```powershell
cd C:\Users\ps3zo\Desktop\Dashboard
node scripts/upload-excel-to-r2.js ./your-file.xlsx
```

Or use Wrangler directly:
```powershell
wrangler r2 object put dashboard-excel-files/dashboard-data.xlsx --file=C:\path\to\your\file.xlsx
```

### Step 4: Test the Endpoint
Open in browser:
```
https://fred-proxy.hibbsdashboard.workers.dev/api/excel-data
```

Should return JSON like:
```json
{
  "Sheet1": [
    { "Column1": "value", "Column2": 123 },
    { "Column1": "value2", "Column2": 456 }
  ],
  "Sheet2": [...]
}
```

### Step 5: Use in Frontend

In your existing dashboard code:

```javascript
// Load Excel data
const excelData = await ExcelDataLoader.load();

// Access specific sheet
const sales = excelData['Sales']; // Array of objects

// Example: Update existing Chart.js chart
if (window.myChart) {
    myChart.data.labels = sales.map(row => row.Date);
    myChart.data.datasets[0].data = sales.map(row => row.Amount);
    myChart.update();
}
```

---

## 🔧 Integration Examples

### Example 1: Update Existing Chart
```javascript
async function updateChartWithExcelData() {
    try {
        const data = await ExcelDataLoader.getSheet('Sales');
        
        // Assuming your Chart.js instance is in window.salesChart
        if (window.salesChart) {
            window.salesChart.data.labels = data.map(row => row.date);
            window.salesChart.data.datasets[0].data = data.map(row => parseFloat(row.value));
            window.salesChart.update();
        }
    } catch (error) {
        console.error('Failed to update chart:', error);
    }
}

// Call on page load or button click
updateChartWithExcelData();
```

### Example 2: Create New Chart from Excel
```javascript
// In your dashboard initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create a chart from the "Revenue" sheet
        window.revenueChart = await createChartFromExcelSheet(
            'Revenue',  // Sheet name
            'revenueChartCanvas',  // Canvas ID
            {
                type: 'bar',
                options: {
                    plugins: { legend: { display: true } }
                }
            }
        );
    } catch (error) {
        console.error('Chart creation failed:', error);
    }
});
```

### Example 3: Load Multiple Sheets
```javascript
async function loadAllExcelData() {
    try {
        const excelData = await ExcelDataLoader.load();
        
        Object.entries(excelData).forEach(([sheetName, rows]) => {
            console.log(`${sheetName}: ${rows.length} rows`);
            // Process each sheet's data
            processSheet(sheetName, rows);
        });
    } catch (error) {
        console.error('Failed to load Excel:', error);
    }
}
```

---

## 📝 Excel File Format Requirements

Your Excel file should have:
- **Column Headers** in the first row (these become JSON object keys)
- **Data rows** below (each row becomes an object)

Example:
```
| Date      | Amount | Category  |
|-----------|--------|-----------|
| 2024-01-01| 1000   | Sales     |
| 2024-01-02| 1500   | Sales     |
```

Becomes:
```json
[
  { "Date": "2024-01-01", "Amount": 1000, "Category": "Sales" },
  { "Date": "2024-01-02", "Amount": 1500, "Category": "Sales" }
]
```

---

## 🚀 Deployment Checklist

- [ ] R2 bucket created on Cloudflare
- [ ] Worker deployed (`wrangler deploy`)
- [ ] Excel file uploaded to R2 as `dashboard-data.xlsx`
- [ ] Test endpoint responds with JSON
- [ ] Frontend loads `excel-loader.js`
- [ ] Chart.js updated with Excel data

---

## 🐛 Troubleshooting

### Issue: "R2 bucket not configured"
- Verify R2 is enabled on your Cloudflare account
- Check `wrangler.toml` has correct binding name: `EXCEL_BUCKET`
- Redeploy: `wrangler deploy`

### Issue: "Excel file not found in R2"
- Verify file is named `dashboard-data.xlsx`
- Check bucket name: `dashboard-excel-files`
- Upload file: `wrangler r2 object put dashboard-excel-files/dashboard-data.xlsx --file=path/to/file.xlsx`

### Issue: CORS errors in browser console
- Excel loader is already in CSP, but check your browser's Network tab
- Verify Worker endpoint is accessible: `https://fred-proxy.hibbsdashboard.workers.dev/api/excel-data`

### Issue: Blank charts or no data
- Check browser console for fetch errors
- Verify Excel column names match your JavaScript code
- Test data with: `const data = await ExcelDataLoader.getSheet('SheetName'); console.log(data);`

---

## 📚 API Reference

### ExcelDataLoader.load()
Returns all sheets as an object:
```javascript
const data = await ExcelDataLoader.load();
// { Sheet1: [...], Sheet2: [...], ... }
```

### ExcelDataLoader.getSheet(name)
Get specific sheet by name:
```javascript
const sales = await ExcelDataLoader.getSheet('Sales');
// Array of objects
```

### createChartFromExcelSheet(sheetName, canvasId, config)
Create Chart.js chart from Excel sheet:
```javascript
const chart = await createChartFromExcelSheet('Sales', 'myCanvas', {
    type: 'line',
    options: { /* Chart.js options */ }
});
```

---

## 🔐 Security Notes

- R2 bucket is private (only accessible via Cloudflare API)
- Worker validates request before accessing R2
- CORS headers are set to `*` (adjust if needed)
- Consider adding authentication for sensitive data

---

## 📞 Next Steps

1. **Enable R2** on your Cloudflare account
2. **Create the bucket** named `dashboard-excel-files`
3. **Deploy the Worker**: `wrangler deploy`
4. **Upload your Excel file**: `wrangler r2 object put dashboard-excel-files/dashboard-data.xlsx --file=your-file.xlsx`
5. **Test the API**: Visit `https://fred-proxy.hibbsdashboard.workers.dev/api/excel-data`
6. **Update your charts** using the frontend code examples above

---

**Files Created/Updated:**
- ✅ `worker/wrangler.toml` - R2 binding config
- ✅ `worker/src/index.js` - Excel endpoint
- ✅ `public/js/excel-loader.js` - Frontend loader (NEW)
- ✅ `public/index.html` - Script inclusion
- ✅ `scripts/upload-excel-to-r2.js` - Upload utility (NEW)
