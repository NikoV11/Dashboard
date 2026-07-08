#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildPagesSite, distDir, rootDir } = require('./build-pages');

const handoffDir = path.join(rootDir, 'uttyler-tech-team-handoff');
const appDir = path.join(handoffDir, 'app');
const embedHeightSource = path.join(handoffDir, 'app', 'js', 'embed-height.js');
const appIndexPath = path.join(appDir, 'index.html');

buildUttTylerTechTeamHandoff().catch((error) => {
    console.error('[build-uttyler-tech-handoff] Build failed:', error);
    process.exit(1);
});

async function buildUttTylerTechTeamHandoff() {
    const existingEmbedHeight = fs.existsSync(embedHeightSource)
        ? fs.readFileSync(embedHeightSource, 'utf8')
        : '';

    await buildPagesSite();

    fs.mkdirSync(appDir, { recursive: true });
    fs.cpSync(distDir, appDir, { recursive: true, force: true });

    if (existingEmbedHeight) {
        const embedTarget = path.join(appDir, 'js', 'embed-height.js');
        fs.mkdirSync(path.dirname(embedTarget), { recursive: true });
        fs.writeFileSync(embedTarget, existingEmbedHeight, 'utf8');
        patchIndexForEmbedHeight();
    }

    console.log(`Built UT Tyler tech team handoff app in ${appDir}`);
}

function patchIndexForEmbedHeight() {
    const html = fs.readFileSync(appIndexPath, 'utf8');
    if (html.includes('./js/embed-height.js')) {
        return;
    }

    const patched = html.replace(
        '</body>',
        '    <script src="./js/embed-height.js" defer></script>\n</body>'
    );

    fs.writeFileSync(appIndexPath, patched, 'utf8');
}
