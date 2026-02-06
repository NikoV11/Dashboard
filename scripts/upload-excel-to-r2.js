#!/usr/bin/env node

/**
 * Upload Excel file to Cloudflare R2 bucket
 * Usage: node upload-excel-to-r2.js <path-to-excel-file>
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const excelPath = process.argv[2];

if (!excelPath) {
    console.error('Usage: node upload-excel-to-r2.js <path-to-excel-file>');
    console.error('Example: node upload-excel-to-r2.js ./data/dashboard-data.xlsx');
    process.exit(1);
}

const fullPath = path.resolve(excelPath);

if (!fs.existsSync(fullPath)) {
    console.error(`Error: File not found: ${fullPath}`);
    process.exit(1);
}

const fileName = path.basename(fullPath);
console.log(`Uploading ${fileName} to R2 bucket...`);

// Use wrangler to upload to R2
const cmd = spawn('npx', [
    'wrangler',
    'r2',
    'object',
    'put',
    'dashboard-excel-files/dashboard-data.xlsx',
    `--file=${fullPath}`
], {
    cwd: path.dirname(fullPath) === process.cwd() ? process.cwd() : path.dirname(fullPath),
    stdio: 'inherit'
});

cmd.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ Successfully uploaded to R2!');
        console.log('File is now available at: R2://dashboard-excel-files/dashboard-data.xlsx');
        console.log('Your Worker endpoint: https://fred-proxy.hibbsdashboard.workers.dev/api/excel-data');
    } else {
        console.error('\n❌ Upload failed');
        process.exit(code);
    }
});
