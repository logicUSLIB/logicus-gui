// Helpers for the browser tests: open LogicUS, load a schema, run it and read the state of its nodes.
const { expect } = require('@playwright/test');

// Opens the app (served by the test server, or the given URL) and collects every error the page reports.
async function openApp(page, url = 'LogicUS.html') {
    const problems = [];
    page.on('console', m => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
    page.on('pageerror', e => problems.push(`page error: ${e.message}`));
    page.on('requestfailed', r => problems.push(`request failed: ${r.url()}`));
    page.on('response', r => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
    page.on('dialog', d => d.dismiss());
    await page.goto(url);
    await page.waitForFunction(() => typeof app !== 'undefined' && typeof graph !== 'undefined');
    await page.evaluate(() => { document.getElementById('popup').style.zIndex = 0; });
    return problems;
}

// Loads a schema (an object, or the file name of an example), runs it and waits until no node is still running.
async function runSchema(page, schema) {
    await page.evaluate(s => {
        loadSchema(typeof s === 'string' ? LOGICUS_EXAMPLES.find(e => e.file === s).schema : s);
        runModel();
    }, schema);
    await page.waitForFunction(() => graph._nodes.every(n =>
        n.properties.state !== 'ready' && n.properties.value_ !== 'running…'), null, { timeout: 90000 });
    return nodeStates(page);
}

async function nodeStates(page) {
    return page.evaluate(() => Object.fromEntries(graph._nodes.map(n => [n.id, {
        type: n.type.split('/').pop(),
        state: n.properties.state,
        value: n.properties.value_ === undefined ? null : String(n.properties.value_),
        error: ERRORS[n.id] || null,
    }])));
}

function expectAllUpToDate(states) {
    for (const [id, s] of Object.entries(states)) {
        expect(s.state, `node ${id} (${s.type}): ${s.error || ''}`).toBe('uptodate');
    }
}

module.exports = { openApp, runSchema, nodeStates, expectAllUpToDate };
