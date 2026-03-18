import { chromium } from 'playwright';

async function run() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const jsErrors = [];
    const requestFailures = [];
    const pageErrors = [];

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            jsErrors.push(msg.text());
        }
    });

    page.on('requestfailed', (request) => {
        requestFailures.push({
            url: request.url(),
            method: request.method(),
            failure: request.failure()?.errorText || 'unknown'
        });
    });

    page.on('pageerror', (error) => {
        pageErrors.push(error.message);
    });

    const results = {
        url: 'http://localhost:3000/',
        timestamp: new Date().toISOString(),
        mainTabs: [],
        subTabs: [],
        jsErrors,
        pageErrors,
        requestFailures,
        failures: []
    };

    try {
        await page.goto(results.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.waitForSelector('.main-tab-btn', { timeout: 120000 });

        const mainTabs = await page.$$eval('.main-tab-btn', (buttons) => buttons.map((btn) => ({
            id: btn.dataset.mainTab,
            text: (btn.textContent || '').trim()
        })));

        for (const mainTab of mainTabs) {
            const mainSelector = `.main-tab-btn[data-main-tab="${mainTab.id}"]`;
            await page.click(mainSelector);
            await page.waitForTimeout(900);

            const subSelector = `#${mainTab.id}-tabs .sub-tab-btn`;
            const subTabs = await page.$$eval(subSelector, (buttons) => buttons.map((btn) => ({
                id: btn.dataset.tab,
                text: (btn.textContent || '').trim()
            })));

            results.mainTabs.push({
                id: mainTab.id,
                text: mainTab.text,
                subTabCount: subTabs.length
            });

            for (const subTab of subTabs) {
                const subBtn = `#${mainTab.id}-tabs .sub-tab-btn[data-tab="${subTab.id}"]`;
                await page.click(subBtn);
                await page.waitForTimeout(1400);

                const tabInfo = await page.evaluate((tabId) => {
                    const panel = document.getElementById(tabId);
                    const isActive = !!panel && panel.classList.contains('active');
                    const canvasEls = panel ? Array.from(panel.querySelectorAll('canvas')) : [];
                    const visibleCanvases = canvasEls.filter((c) => {
                        const rect = c.getBoundingClientRect();
                        return rect.width > 10 && rect.height > 10;
                    }).length;

                    return {
                        tabId,
                        isActive,
                        canvasCount: canvasEls.length,
                        visibleCanvases
                    };
                }, subTab.id);

                const entry = {
                    mainTab: mainTab.id,
                    subTab: subTab.id,
                    label: subTab.text,
                    ...tabInfo
                };
                results.subTabs.push(entry);

                if (!entry.isActive) {
                    results.failures.push(`Sub-tab did not activate: ${subTab.id}`);
                }
            }
        }

        await page.waitForTimeout(1500);
    } catch (error) {
        results.failures.push(`Runner exception: ${error.message}`);
    } finally {
        await context.close();
        await browser.close();
    }

    const summary = {
        mainTabs: results.mainTabs.length,
        subTabs: results.subTabs.length,
        inactiveSubTabs: results.subTabs.filter((item) => !item.isActive).length,
        jsErrors: results.jsErrors.length,
        pageErrors: results.pageErrors.length,
        requestFailures: results.requestFailures.length,
        failures: results.failures.length
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ summary, results }, null, 2));

    if (summary.inactiveSubTabs > 0 || summary.pageErrors > 0 || summary.failures > 0) {
        process.exitCode = 1;
    }
}

run();
