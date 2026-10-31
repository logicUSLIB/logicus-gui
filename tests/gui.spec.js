const { test, expect } = require('@playwright/test');
const { openApp, runSchema, nodeStates, expectAllUpToDate } = require('./helpers');

test('the app loads without errors', async ({ page }) => {
    const problems = await openApp(page);
    await page.waitForTimeout(1000);
    expect(problems).toEqual([]);
    await expect(page.locator('#right-panel button')).toContainText(['EXAMPLES', 'LOAD SCHEMA', 'SAVE SCHEMA', 'RUN SCHEMA']);
});

test('the examples panel lists and opens the examples', async ({ page }) => {
    await openApp(page);
    await page.locator('#showMenu').click();
    await page.getByRole('button', { name: 'EXAMPLES' }).click();
    const examples = page.locator('#examples-list .example');
    await expect(examples).toHaveCount(4);
    await examples.filter({ hasText: 'Automated provers' }).getByRole('button', { name: 'OPEN' }).click();
    await expect.poll(() => page.evaluate(() => graph._nodes.length)).toBe(6);
    await expect(page.locator('#popup')).toHaveCSS('z-index', '0');
});

test('example: propositional logic', async ({ page }) => {
    const problems = await openApp(page);
    const states = await runSchema(page, 'examplePL.JSON');
    expectAllUpToDate(states);
    expect(states[9].value).toBe('{{¬ p,¬ r},{¬ q,¬ r},{p,s},{q,t},{u,¬ s,¬ t},{r},{¬ u}}');
    // the set with the negated conclusion has no model: every row of the truth table evaluates to F
    const rows = states[6].value.trim().split('\n').slice(1);
    expect(rows).toHaveLength(64);
    expect(rows.every(r => r.trim().endsWith('F'))).toBe(true);
    expect(problems).toEqual([]);
});

test('example: first-order semantic tableau', async ({ page }) => {
    const problems = await openApp(page);
    const states = await runSchema(page, 'exampleSTFOL.JSON');
    expectAllUpToDate(states);
    expect(states[8].value).toContain('digraph');
    expect(problems).toEqual([]);
});

test('example: automated provers', async ({ page }) => {
    const problems = await openApp(page);
    const states = await runSchema(page, 'provers-groups.JSON');
    expectAllUpToDate(states);
    expect(states[4].value).toMatch(/^THEOREM PROVED/);
    expect(states[5].value).toMatch(/^Theorem/);
    expect(states[6].value).toMatch(/^MODEL FOUND \(size 8\)/);
    // the counter-model is shown with the value of each formula in it
    await page.evaluate(() => { openTABLESPANEL(); displayTable(6); });
    const result = page.locator('#graph-display .prover-result');
    await expect(result.locator('h3').first()).toHaveText('Mace4: MODEL FOUND (size 8)');
    await expect(result.locator('table.lus-model-table').last()).toContainText('(goal)');
    expect(problems).toEqual([]);
});

test('example: eight queens loads', async ({ page }) => {
    const problems = await openApp(page);
    await page.evaluate(() => fetch('examples/CSP_8Q.JSON').then(r => r.json()).then(loadSchema));
    expect(Object.keys(await nodeStates(page))).toHaveLength(3);
    expect(problems).toEqual([]);
});
