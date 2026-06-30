#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildPagesSite, distDir, rootDir } = require('./build-pages');

const targetDir = path.join(rootDir, 'uttyler-requested-inline-fix');
const indexPath = path.join(targetDir, 'index.html');
const dashboardPhpPath = path.join(targetDir, 'dashboard.php');
const cmsPreviewPath = path.join(targetDir, 'cms-preview.html');
const stylesPath = path.join(targetDir, 'styles.css');
const imagesDir = path.join(targetDir, 'images');
const readmePath = path.join(targetDir, 'README.md');

const topIconReplacements = [
    {
        marker: 'aria-label="Hibbs Institute Website"',
        replacement: '<img class="social-icon-image" src="./images/icon-globe.svg" alt="" width="20" height="20">'
    },
    {
        marker: 'aria-label="LinkedIn"',
        replacement: '<img class="social-icon-image" src="./images/icon-linkedin.svg" alt="" width="20" height="20">'
    }
];

const shareButtons = [
    'shareGDPBtn',
    'shareCPIBtn',
    'shareUnemploymentBtn',
    'sharePayemsBtn',
    'shareEmploymentBtn',
    'shareSalesTaxBtn',
    'shareMedianPriceBtn',
    'shareTaxBtn',
    'shareMortgageBtn'
];

const iconFixCss = `

/* Targeted UT Tyler inline integration fix for the missing social and share icons */
.social-icon-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    line-height: 0;
    flex-shrink: 0;
}

.social-icon-image {
    display: block !important;
    width: 20px !important;
    height: 20px !important;
    max-width: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    flex-shrink: 0;
}

.icon-only-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    padding-left: 12px;
    padding-right: 12px;
}

.icon-button-image {
    display: block !important;
    width: 16px !important;
    height: 16px !important;
    max-width: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    flex-shrink: 0;
    pointer-events: none;
}
`.trimStart();

const readme = `# UT Tyler Requested Inline Fix

This folder is generated automatically from the latest dashboard build.

## What it includes

- the current dashboard code from \`dist/\`
- this morning's automatic tax-data update logic and latest bundled fallback data
- the UT Tyler-specific icon swap for the missing \`globe\`, \`LinkedIn\`, and chart \`share\` icons

## How it is generated

Run:

\`\`\`bash
npm run build:uttyler
\`\`\`

That command:

1. rebuilds the main dashboard
2. copies the latest build into this folder
3. applies only the UT Tyler icon fixes

## How I can preview it before sending it

I can also open:

\`cms-preview.html\`

This preview page loads the UT Tyler global CSS on top of the generated dashboard so I can check the package against a close approximation of the CMS styling, even without direct CMS editing access.

## Important note

This folder stays in sync with your latest code when you rebuild it, but the UT Tyler website will still need the tech team to upload or publish the refreshed files on their side.
`;

const iconAssets = {
    'icon-globe.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="#0F172A" stroke-width="2"/>
  <line x1="2" y1="12" x2="22" y2="12" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 2C14.5417 4.64232 16 8.23858 16 12C16 15.7614 14.5417 19.3577 12 22C9.45833 19.3577 8 15.7614 8 12C8 8.23858 9.45833 4.64232 12 2Z" stroke="#0F172A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
    'icon-linkedin.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
  <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447Z" fill="#0F172A"/>
  <path d="M5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433Z" fill="#0F172A"/>
  <path d="M7.119 20.452H3.555V9H7.119V20.452Z" fill="#0F172A"/>
  <rect x="0.75" y="0.75" width="22.5" height="22.5" rx="3.25" stroke="#0F172A" stroke-width="1.5"/>
</svg>
`,
    'icon-share.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
  <circle cx="18" cy="5" r="3" stroke="#0F172A" stroke-width="2"/>
  <circle cx="6" cy="12" r="3" stroke="#0F172A" stroke-width="2"/>
  <circle cx="18" cy="19" r="3" stroke="#0F172A" stroke-width="2"/>
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
</svg>
`
};

buildUttTylerInlineFix();

function buildUttTylerInlineFix() {
    buildPagesSite();

    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.cpSync(distDir, targetDir, { recursive: true, force: true });

    writeIconAssets();
    const updatedIndex = rewriteHtmlFiles();
    patchStylesheet();
    fs.copyFileSync(indexPath, dashboardPhpPath);
    fs.writeFileSync(cmsPreviewPath, buildCmsPreviewHtml(updatedIndex), 'utf8');
    fs.writeFileSync(readmePath, readme, 'utf8');

    console.log(`Built UT Tyler inline fix package in ${targetDir}`);
}

function rewriteHtmlFiles() {
    const updatedIndex = transformHtml(fs.readFileSync(indexPath, 'utf8'));
    fs.writeFileSync(indexPath, updatedIndex, 'utf8');
    return updatedIndex;
}

function transformHtml(html) {
    let nextHtml = html;

    topIconReplacements.forEach(({ marker, replacement }) => {
        const anchorPattern = new RegExp(`(<a[^>]*${escapeRegExp(marker)}[^>]*>)([\\s\\S]*?)(</a>)`);
        nextHtml = nextHtml.replace(anchorPattern, (match, openTag, _content, closeTag) => {
            const classAdjustedOpenTag = openTag.includes('class="social-icon-link"')
                ? openTag
                : openTag.replace('<a ', '<a class="social-icon-link" ');
            return `${classAdjustedOpenTag}\n                        ${replacement}\n                    ${closeTag}`;
        });
    });

    shareButtons.forEach((buttonId) => {
        const buttonPattern = new RegExp(`(<button[^>]*id="${escapeRegExp(buttonId)}"[^>]*class=")([^"]*)(".*?>)([\\s\\S]*?)(</button>)`);
        nextHtml = nextHtml.replace(buttonPattern, (match, prefix, classValue, suffix, _content, closeTag) => {
            const nextClassValue = classValue.includes('icon-only-btn')
                ? classValue
                : `${classValue} icon-only-btn`;
            return `${prefix}${nextClassValue}${suffix}\n                                <img class="icon-button-image" src="./images/icon-share.svg" alt="" width="16" height="16" aria-hidden="true">\n                            ${closeTag}`;
        });
    });

    return nextHtml;
}

function patchStylesheet() {
    const stylesheet = fs.readFileSync(stylesPath, 'utf8');
    const cleanedStylesheet = stylesheet.replace(/\n\/\* Targeted UT Tyler inline integration fix[\s\S]*$/m, '');
    fs.writeFileSync(stylesPath, `${cleanedStylesheet}${iconFixCss}`, 'utf8');
}

function buildCmsPreviewHtml(html) {
    const previewHead = `
    <!-- UT Tyler CMS preview assets -->
    <link rel="stylesheet" href="https://www.uttyler.edu/_resources/css/style.css">
    <link rel="stylesheet" href="https://www.uttyler.edu/_resources/css/oustyles.css">
`;

    const previewBanner = `
    <div style="max-width: 1280px; margin: 0 auto 16px; padding: 12px 16px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; color: #7c2d12; font: 600 14px/1.5 Arial, sans-serif;">
        CMS preview mode: this page loads UT Tyler global CSS together with the dashboard so I can catch likely styling conflicts before sending the package.
    </div>`;

    return html
        .replace(
            /(<meta\s+name="excel-data-endpoint"\s+content="[^"]*")/i,
            '$1 data-use-remote-on-localhost="true"'
        )
        .replace(
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.uttyler.edu;"
        )
        .replace('</head>', `${previewHead}</head>`)
        .replace('<body>', `<body>${previewBanner}`);
}

function writeIconAssets() {
    fs.mkdirSync(imagesDir, { recursive: true });

    Object.entries(iconAssets).forEach(([filename, contents]) => {
        fs.writeFileSync(path.join(imagesDir, filename), contents, 'utf8');
    });
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
