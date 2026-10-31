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
    await expect(examples).toHaveCount(5);
    // the list fills the panel (it used to be squeezed into the 70px column of the panel grid)
    const width = await page.locator('#examples-list').evaluate(e => e.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(page.viewportSize().width * 0.8);
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
    // numbered by depth in the branch, with the rules (and Leibniz law) on the edges, like the other tableaux
    expect(states[8].value).toContain('10. (c₁ = e)');
    expect(states[8].value).toContain('⊥(𝓛𝓛10(6))');
    expect(problems).toEqual([]);
});

test('example: ground and free-variable tableaux', async ({ page }) => {
    const problems = await openApp(page);
    const states = await runSchema(page, 'exampleFVTableau.JSON');
    expectAllUpToDate(states);
    // the ground tableau never instantiates with f(a): some branches are left undecided
    expect(states[8].value).toContain('ⓤ');
    expect(states[8].value).toContain('"5. (P(a) → Q(f(a)))"');
    // the free-variable tableau closes, and shows the substitution
    expect(states[9].value).toContain('Closed tableau');
    expect(states[9].value).toContain('σ = {x₁/a, x₂/f(a), x₃/f(a)}');
    expect(states[9].value).toContain('⊥(6,8){x₂/f(a)}');
    await page.evaluate(() => { openGRAPHSPANEL(); displayGraph(9); });
    await expect(page.locator('#graphContainer')).toContainText('Closed tableau');
    expect(problems).toEqual([]);
});

test('the semantic tableau node has a free-variable mode with the limits maxU and maxD', async ({ page }) => {
    const problems = await openApp(page);
    const widgets = await page.evaluate(() => {
        const n = LiteGraph.createNode('LogicUS-FOL/Algorithms/SemanticTableauFOL');
        graph.add(n);
        const names = () => n.widgets.map(w => w.name).filter(x => x.startsWith('max'));
        const enhanced = names();
        n.properties.performMode = 'variables';
        n.onPropertyChanged();
        return { enhanced, variables: names() };
    });
    expect(widgets.enhanced).toEqual(['maxC', 'maxS']);
    expect(widgets.variables).toEqual(['maxD', 'maxU']);
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
    await page.evaluate(() => loadSchema(LOGICUS_EXAMPLES.find(e => e.file === 'CSP_8Q.JSON').schema));
    expect(Object.keys(await nodeStates(page))).toHaveLength(3);
    expect(problems).toEqual([]);
});

test('example: eight queens is solved, with the variables of the problem', async ({ page }) => {
    const problems = await openApp(page);
    // SolveDIMACS on the DIMACS file saved in the example (the CSP node is run from the CSP panel)
    const value = await page.evaluate(() => {
        loadSchema(JSON.parse(JSON.stringify(LOGICUS_EXAMPLES.find(e => e.file === 'CSP_8Q.JSON').schema)));
        graph.getNodeById(3).widget2.callback();
        return graph.getNodeById(3).properties.value_;
    });
    expect(value).toMatch(/^SAT\. True variables \(8\): .* The other 56 variables are false\.$/);
    const queens = [...value.matchAll(/p<sub>(\d),(\d)<\/sub>/g)].map(m => [Number(m[1]), Number(m[2])]);
    expect(queens).toHaveLength(8);
    for (const f of [([r]) => r, ([, c]) => c, ([r, c]) => r - c, ([r, c]) => r + c]) {
        expect(new Set(queens.map(f)).size, 'no two queens attack each other').toBe(8);
    }
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.evaluate(() => graph.getNodeById(3).widget4.callback()),
    ]);
    const text = require('fs').readFileSync(await download.path(), 'utf8');
    expect(text).toMatch(/^SAT\n\nTrue variables \(8\): p_\{0,\d\}, p_\{1,\d\}/);
    expect(text).toContain('False variables (56): p_{0,');
    expect(problems).toEqual([]);
});
