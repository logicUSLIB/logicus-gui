// LogicUS opened as a local file (double click on LogicUS.html), without a web server.
const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('@playwright/test');
const { openApp, runSchema, expectAllUpToDate } = require('./helpers');

const localFile = pathToFileURL(path.resolve(__dirname, '..', 'LogicUS.html')).href;

test('the examples and the provers work from a local file', async ({ page }) => {
    const problems = await openApp(page, localFile);
    await page.locator('#showMenu').click();
    await page.getByRole('button', { name: 'EXAMPLES' }).click();
    await expect(page.locator('#examples-list .example')).toHaveCount(5);
    const states = await runSchema(page, 'provers-groups.JSON');
    expectAllUpToDate(states);
    expect(states[4].value).toMatch(/^THEOREM PROVED/);
    expect(states[5].value).toMatch(/^Theorem/);
    expect(states[6].value).toMatch(/^MODEL FOUND \(size 8\)/);
    expect(problems).toEqual([]);
});

test('a propositional example works from a local file', async ({ page }) => {
    const problems = await openApp(page, localFile);
    expectAllUpToDate(await runSchema(page, 'examplePL.JSON'));
    expect(problems).toEqual([]);
});
