// The PROVER9/MACE4 panel: free problems, options, formats, input files, and the options of a node.
const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { openApp, runSchema } = require('./helpers');

const GROUP = 'x * (y * z) = (x * y) * z.\ne * x = x.\nx\' * x = e.\n';

async function openPanel(page) {
    await page.locator('#showMenu').click();
    await page.getByRole('button', { name: 'PROVER9/MACE4' }).click();
}

async function run(page, program) {
    await page.locator(`#p9m4-run-${program} .p9m4-start`).click();
    const state = page.locator(`#p9m4-run-${program} .p9m4-state`);
    await expect(state).not.toHaveText(/^$|running/, { timeout: 60000 });
    return state.textContent();
}

async function show(page, program, view) {
    await page.selectOption(`#p9m4-run-${program} .p9m4-view`, view);
    await page.locator(`#p9m4-run-${program} button`, { hasText: 'SHOW' }).click();
    const text = page.locator('#p9m4-result-text');
    await expect(text).not.toHaveText(/^…$/);
    return text.textContent();
}

test('a free problem: Prover9 proof and Mace4 model, in the formats of prooftrans and interpformat', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await page.fill('#p9m4-assumptions', GROUP + 'x * x = e.');
    await page.fill('#p9m4-goals', 'x * y = y * x.');
    expect(await run(page, 'prover9')).toBe('THEOREM PROVED.');
    expect(await show(page, 'prover9', 'proof')).toContain('============================== PROOF');
    const parents = await show(page, 'prover9', 'parents_only');
    expect(parents).toMatch(/\$F\.\s+\[[\d,]+\]\./);         // only the parents, no inference rules
    expect(await show(page, 'prover9', 'xml')).toContain('<proof');
    // with x·x·x·x = e the operation need not be commutative
    await page.fill('#p9m4-assumptions', GROUP.replace("x' * x = e.\n", '') + 'x * (x * (x * x)) = e.');
    expect(await run(page, 'mace4')).toBe('1 MODEL FOUND (size 8).');
    expect(await show(page, 'mace4', 'tabular')).toContain('% Interpretation of size 8');
    expect(await show(page, 'mace4', 'portable')).toMatch(/^\[\s*\[/m);
    expect(problems).toEqual([]);
});

test('options apply their dependencies, and go to the input file', async ({ page }) => {
    await openApp(page);
    await openPanel(page);
    await page.fill('#p9m4-assumptions', 'f(f(f(x))) = x.\nf(a) != a.');
    await page.getByRole('button', { name: 'PROVER9 OPTIONS' }).click();
    await page.locator('.p9m4-groups button', { hasText: 'Inference rules' }).click();
    await page.locator('.p9m4-option', { hasText: /^\s*hyper_resolution\s*$/ }).locator('input').check();
    await expect(page.locator('.p9m4-option.dependency')).toHaveText(/pos_hyper_resolution/);
    await page.getByRole('button', { name: 'MACE4 OPTIONS' }).click();
    const domain = page.locator('.p9m4-option', { hasText: /^\s*domain_size/ }).locator('input');
    await domain.fill('3');
    await domain.dispatchEvent('change');
    await page.getByRole('button', { name: 'INPUT FILE', exact: true }).click();
    const input = await page.locator('#p9m4-input-ladr').textContent();
    expect(input).toContain('set(ignore_option_dependencies).');
    expect(input).toMatch(/if\(Prover9\)\.[^]*set\(hyper_resolution\)\.\n\s*set\(pos_hyper_resolution\)\.[^]*end_if\./);
    expect(input).toMatch(/if\(Mace4\)\.[^]*assign\(domain_size, 3\)\.\n\s*assign\(start_size, 3\)\.\n\s*assign\(end_size, 3\)\.[^]*end_if\./);
    // Mace4 searches only size 3
    expect(await run(page, 'mace4')).toBe('1 MODEL FOUND (size 3).');
});

test('syntax errors are reported, and a long search can be stopped', async ({ page }) => {
    await openApp(page);
    await openPanel(page);
    await page.fill('#p9m4-assumptions', 'P(a | Q(b).');
    await page.getByRole('button', { name: 'WELL FORMED?' }).click();
    await expect(page.locator('#p9m4-syntax')).toHaveText(/ERROR/);
    await page.fill('#p9m4-assumptions', GROUP.replace("x' * x = e.\n", '') + 'x * (x * (x * x)) = e.');
    await page.fill('#p9m4-goals', 'x * y = y * x.');
    await page.fill('#p9m4-run-prover9 [data-option="time"]', '-1');
    await page.locator('#p9m4-run-prover9 [data-option="time"]').dispatchEvent('change');
    await page.locator('#p9m4-run-prover9 .p9m4-start').click();
    await page.waitForTimeout(1500);
    await page.locator('#p9m4-run-prover9 .p9m4-stop').click();
    await expect(page.locator('#p9m4-run-prover9 .p9m4-state')).toHaveText('Stopped.');
});

test('an input file is saved and loaded back', async ({ page }) => {
    // with prolog style variables, variables are capitalised (x would be a constant)
    const assumptions = 'X * (Y * Z) = (X * Y) * Z.\ne * X = X.\nX\' * X = e.\nX * X = e.';
    await openApp(page);
    await openPanel(page);
    await page.fill('#p9m4-assumptions', assumptions);
    await page.fill('#p9m4-goals', 'X * Y = Y * X.');
    await page.getByRole('button', { name: 'LANGUAGE' }).click();
    await page.locator('.p9m4-option', { hasText: 'prolog_style_variables' }).locator('input').check();
    await page.getByRole('button', { name: 'PROVER9 OPTIONS' }).click();
    const order = page.locator('.p9m4-option', { hasText: /^\s*order/ }).locator('select');
    await order.selectOption('kbo');
    await page.getByRole('button', { name: 'E OPTIONS' }).click();
    await page.locator('.p9m4-groups button', { hasText: 'Search' }).click();
    await page.fill('#p9m4-e-term-ordering-arg', 'KBO6');
    await page.locator('#p9m4-e-term-ordering-arg').dispatchEvent('change');
    await page.getByRole('button', { name: 'ADDITIONAL INPUT' }).click();
    await page.locator('#p9m4-tab textarea').fill('formulas(hints).\nx * y = y * x.\nend_of_list.');
    await page.locator('#p9m4-tab textarea').dispatchEvent('input');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'SAVE INPUT FILE' }).click()]);
    const saved = fs.readFileSync(await download.path(), 'utf8');
    expect(saved).toContain('set(prolog_style_variables).');
    expect(saved).toContain('assign(order, kbo).');
    expect(saved).toMatch(/^% LogicUS E options: .*--term-ordering=KBO6/m);
    // a new page: load the file
    await page.reload();
    await page.waitForFunction(() => typeof app !== 'undefined');
    await page.evaluate(() => { document.getElementById('popup').style.zIndex = 0; });
    await openPanel(page);
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'LOAD INPUT FILE' }).click()]);
    await chooser.setFiles(await download.path());
    await expect(page.locator('#p9m4-assumptions')).toHaveValue(assumptions);
    await page.getByRole('button', { name: 'INPUT FILE', exact: true }).click();
    expect(await page.locator('#p9m4-input-ladr').textContent()).toBe(saved);
    expect(await run(page, 'prover9')).toBe('THEOREM PROVED.');
});

test('a Prover9Mace4 node keeps its options and runs with them', async ({ page }) => {
    const problems = await openApp(page);
    await runSchema(page, 'provers-groups.JSON');
    await page.evaluate(() => graph.getNodeById(6).widget3.callback());   // OPTIONS of the Mace4 node
    await expect(page.locator('pre.p9m4-input')).toContainText('formulas(assumptions).');
    await page.getByRole('button', { name: 'MACE4 OPTIONS' }).click();
    const models = page.locator('.p9m4-option', { hasText: /^\s*max_models/ }).locator('input');
    await models.fill('2');
    await models.dispatchEvent('change');
    expect(await run(page, 'mace4')).toBe('2 MODELS FOUND (size 8).');
    await page.getByRole('button', { name: 'CLOSE' }).click();
    const node = await page.evaluate(() => {
        const n = graph.getNodeById(6);
        return { value: n.properties.value_, input: n.input, options: n.properties.p9m4.mace4 };
    });
    expect(node.value).toMatch(/^2 MODELS FOUND \(size 8\)/);
    expect(node.input).toMatch(/if\(Mace4\)\.[^]*assign\(max_models, 2\)\./);
    expect(node.options).toEqual({ max_models: 2 });
    // the options are saved with the schema
    const saved = await page.evaluate(() => JSON.stringify(graph.serialize()));
    await page.evaluate(s => loadSchema(JSON.parse(s)), saved);
    expect(await page.evaluate(() => graph.getNodeById(6).properties.p9m4.mace4)).toEqual({ max_models: 2 });
    expect(problems).toEqual([]);
});

async function runE(page) {
    return run(page, 'eprover');
}

test('E on a free problem: the formulas go to TPTP, the options to the command line', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await page.fill('#p9m4-assumptions', GROUP + 'x * x = e.');
    await page.fill('#p9m4-goals', 'x * y = y * x.');
    expect(await runE(page)).toBe('SZS status Theorem.');
    expect(await page.locator('#p9m4-result-text').textContent()).toMatch(/SZS output start CNFRefutation[^]*SZS output end/);
    await page.getByRole('button', { name: 'E OPTIONS' }).click();
    await page.locator('.p9m4-groups button', { hasText: 'Basic' }).click();
    await page.locator('#p9m4-e-print-statistics').check();
    await expect(page.locator('.p9m4-tab code').first()).toHaveText(/^eprover .*--print-statistics.* --cpu-limit=60$/);
    await page.getByRole('button', { name: 'INPUT FILE', exact: true }).click();
    await expect(page.locator('#p9m4-input-tptp')).toContainText('fof(goals,conjecture,');
    await page.getByRole('button', { name: 'FORMULAS' }).click();
    await page.fill('#p9m4-assumptions', 'P(a) | Q(a).');
    await page.fill('#p9m4-goals', 'P(a).');
    expect(await runE(page)).toBe('SZS status CounterSatisfiable.');
    expect(problems).toEqual([]);
});

test('a TPTP problem is loaded with tptp_to_ladr, keeping its variables', async ({ page }, testInfo) => {
    await openApp(page);
    await openPanel(page);
    const file = testInfo.outputPath('problem.p');
    // X is a variable of the clause: it must not become a constant in LADR
    fs.writeFileSync(file, 'cnf(c1, axiom, ~ p(X) | q(X)).\ncnf(c2, axiom, p(a)).\nfof(g, conjecture, q(a)).\n');
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'LOAD INPUT FILE' }).click()]);
    await chooser.setFiles(file);
    await expect(page.locator('#p9m4-file-message')).toHaveText(/TPTP problem read/);
    await expect(page.locator('#p9m4-goals')).toHaveValue(/q\(a\)/);
    expect(await run(page, 'prover9')).toBe('THEOREM PROVED.');
    expect(await runE(page)).toBe('SZS status Theorem.');
});

test('an EProver node keeps its options and runs with them', async ({ page }) => {
    const problems = await openApp(page);
    await runSchema(page, 'provers-groups.JSON');
    await page.evaluate(() => graph.getNodeById(5).widget3.callback());   // OPTIONS of the E node
    await expect(page.locator('.p9m4-tabs button')).toHaveText(['FORMULAS', 'E OPTIONS', 'INPUT FILE']);
    await expect(page.locator('.p9m4-run')).toHaveCount(1);
    await expect(page.locator('pre.p9m4-input')).toContainText('fof(');
    await page.getByRole('button', { name: 'E OPTIONS' }).click();
    await page.locator('#p9m4-e-print-statistics').check();
    expect(await runE(page)).toBe('SZS status Theorem.');
    await page.getByRole('button', { name: 'CLOSE' }).click();
    const node = await page.evaluate(() => {
        const n = graph.getNodeById(5);
        return { value: n.properties.value_, args: n.proverArguments(), options: n.properties.p9m4.eprover };
    });
    expect(node.value).toMatch(/^Theorem/);
    expect(node.args).toEqual(['--silent', '--proof-object', '--print-statistics', '--auto', '--cpu-limit=10']);
    const saved = await page.evaluate(() => JSON.stringify(graph.serialize()));
    await page.evaluate(s => loadSchema(JSON.parse(s)), saved);
    expect(await page.evaluate(() => graph.getNodeById(5).properties.p9m4.eprover)).toEqual(node.options);
    expect(problems).toEqual([]);
});
