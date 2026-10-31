const { test, expect } = require('@playwright/test');
const { openApp, runSchema, expectAllUpToDate } = require('./helpers');

// A schema with two typed FOL sets, A and G, connected to Prover9, Mace4 and E.
function proverSchema(assumptions, goals, seconds = 10) {
    const set = (id, value, links) => ({
        id, type: 'LogicUS-FOL/SetFOL/SetFOL', pos: [40, 40 + 200 * (id - 1)], size: [210, 58], flags: {}, order: id - 1,
        mode: 0, inputs: [], outputs: [{ name: '', type: 'SetFOL', links }],
        properties: { state: 'edited', source: 'input', value, entries: 0 },
    });
    const prover = (id, type, mode, a, g) => ({
        id, type, pos: [420, 40 + 210 * (id - 3)], size: [230, 110], flags: {}, order: id - 1, mode: 0,
        inputs: [{ name: 'A', type: 'SetFOL', link: a }, { name: 'G', type: 'SetFOL', link: g }],
        properties: { state: 'edited', mode, seconds, domain: 6, xopts: '' },
    });
    return {
        last_node_id: 5, last_link_id: 6, groups: [], config: {}, extra: {}, version: 0.4,
        nodes: [
            set(1, assumptions, [1, 3, 5]),
            set(2, goals, [2, 4, 6]),
            prover(3, 'LogicUS-EXT/Solvers/Prover9Mace4', 'prover9', 1, 2),
            prover(4, 'LogicUS-EXT/Solvers/Prover9Mace4', 'mace4', 3, 4),
            prover(5, 'LogicUS-EXT/Solvers/EProver', 'eprover', 5, 6),
        ],
        links: [[1, 1, 0, 3, 0, 'SetFOL'], [2, 2, 0, 3, 1, 'SetFOL'], [3, 1, 0, 4, 0, 'SetFOL'],
                [4, 2, 0, 4, 1, 'SetFOL'], [5, 1, 0, 5, 0, 'SetFOL'], [6, 2, 0, 5, 1, 'SetFOL']],
    };
}

test('a valid argument is proved, and Mace4 finds no counter-model', async ({ page }) => {
    const problems = await openApp(page);
    const states = await runSchema(page, proverSchema('∀[X] (P(X) → Q(X)). P(a)', '∃[Y] Q(Y)'));
    expectAllUpToDate(states);
    expect(states[3].value).toMatch(/^THEOREM PROVED/);
    expect(states[4].value).toMatch(/^NO MODEL\. .* at most 6 elements/);
    expect(states[5].value).toMatch(/^Theorem/);
    expect(problems).toEqual([]);
});

test('an invalid argument gets a counter-model, checked against the formulas', async ({ page }) => {
    const problems = await openApp(page);
    const states = await runSchema(page, proverSchema('∀[X] (P(X) → Q(X)). P(a)', 'Q(b)'));
    expectAllUpToDate(states);
    expect(states[3].value).toMatch(/^SEARCH FAILED/);
    expect(states[4].value).toMatch(/^MODEL FOUND \(size 2\)/);
    expect(states[5].value).toMatch(/^CounterSatisfiable/);
    // in the counter-model the assumptions are true and the goal is false
    const checks = await page.evaluate(() => {
        const html = document.createElement('div');
        html.innerHTML = MEMORY['Tables'][4].content;
        const rows = [...html.querySelectorAll('table.lus-model-table')].pop().querySelectorAll('tbody tr');
        return [...rows].map(r => [...r.children].map(c => c.textContent));
    });
    expect(checks).toEqual([['∀x(P(x) → Q(x))', 'true'], ['P(a)', 'true'], ['Q(b)   (goal)', 'false']]);
    expect(problems).toEqual([]);
});

test('free variables are universally quantified', async ({ page }) => {
    await openApp(page);
    const states = await runSchema(page, proverSchema('P(X)', 'P(a)'));
    expectAllUpToDate(states);
    expect(states[3].value).toMatch(/^THEOREM PROVED/);
    expect(states[5].value).toMatch(/^Theorem/);
});

test('the time limit stops a search that does not end', async ({ page }) => {
    await openApp(page);
    // groups where x·x·x·x = e need not be commutative, and no proof search ends
    const axioms = '∀[X]∀[Y]∀[Z] (m(m(X,Y),Z) = m(X,m(Y,Z))). ∀[X] (m(e,X) = X). ∀[X] (m(X,m(X,m(X,X))) = e)';
    const start = Date.now();
    const states = await runSchema(page, proverSchema(axioms, '∀[X]∀[Y] (m(X,Y) = m(Y,X))', 2));
    expect(Date.now() - start).toBeLessThan(30000);
    expect(states[3].value).toMatch(/^TIME LIMIT/);
    expect(states[5].value).toMatch(/^(ResourceOut|TIME LIMIT)/);
});
