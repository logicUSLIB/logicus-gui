// The PROVER9/MACE4 panel: free problems, options, formats, input files, and the options of a node.
const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { openApp, runSchema } = require('./helpers');

const GROUP = 'x * (y * z) = (x * y) * z.\ne * x = x.\nx\' * x = e.\n';

async function openPanel(page) {
    await page.locator('#showMenu').click();
    await page.getByRole('button', { name: 'PROVER9/MACE4' }).click();
}

async function chooseProver(page, system) {
    await page.locator(`.p9m4-systems input[value="${system}"]`).check();
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
    // the options of E are kept in the input file too
    await chooseProver(page, 'e');
    await page.getByRole('button', { name: 'E OPTIONS' }).click();
    await page.locator('.p9m4-groups button', { hasText: 'Search' }).click();
    await page.fill('#p9m4-e-term-ordering-arg', 'KBO6');
    await page.locator('#p9m4-e-term-ordering-arg').dispatchEvent('change');
    await chooseProver(page, 'ladr');
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

test('the free problem shows only the tabs and programs of the chosen prover, and keeps the formulas', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await expect(page.locator('.p9m4-tabs button')).toHaveText(['FORMULAS', 'LANGUAGE', 'PROVER9 OPTIONS', 'MACE4 OPTIONS', 'ADDITIONAL INPUT', 'INPUT FILE']);
    await expect(page.locator('.p9m4-run')).toHaveCount(2);
    await page.fill('#p9m4-assumptions', 'p(a).');
    await chooseProver(page, 'e');
    await expect(page.locator('.p9m4-tabs button')).toHaveText(['FORMULAS', 'LANGUAGE', 'E OPTIONS', 'INPUT FILE']);
    await expect(page.locator('.p9m4-run')).toHaveCount(1);
    await expect(page.locator('#p9m4-run-eprover')).toBeVisible();
    await expect(page.locator('#p9m4-assumptions')).toHaveValue('p(a).');
    // the input file is the one of the chosen prover
    await page.getByRole('button', { name: 'INPUT FILE', exact: true }).click();
    await expect(page.locator('#p9m4-input-tptp')).toContainText('cnf(sos,axiom,p(a)).');
    await expect(page.locator('#p9m4-input-ladr')).toHaveCount(0);
    // the choice is kept when the panel is opened again
    await page.getByRole('button', { name: 'CLOSE' }).click();
    await page.evaluate(() => openP9M4PANEL());
    await expect(page.locator('.p9m4-systems input[value="e"]')).toBeChecked();
    await chooseProver(page, 'ladr');
    await page.getByRole('button', { name: 'INPUT FILE', exact: true }).click();
    await expect(page.locator('#p9m4-input-tptp')).toHaveCount(0);
    await expect(page.locator('#p9m4-input-ladr')).toContainText('p(a).');
    expect(problems).toEqual([]);
});

test('E on a free problem: the formulas go to TPTP, the options to the command line', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await chooseProver(page, 'e');
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
    await chooseProver(page, 'e');
    expect(await runE(page)).toBe('SZS status Theorem.');
});

test('E reads a problem written in TPTP, which is saved and loaded as it is', async ({ page }, testInfo) => {
    const problems = await openApp(page);
    await openPanel(page);
    await chooseProver(page, 'e');
    await page.fill('#p9m4-assumptions', GROUP + 'x * x = e.');
    await page.fill('#p9m4-goals', 'x * y = y * x.');
    // the TPTP problem starts as the translation of the LADR formulas
    await page.locator('.p9m4-elang input[value="tptp"]').check();
    await expect(page.locator('#p9m4-tptp')).toHaveValue(/fof\(goals,conjecture,/);
    await expect(page.locator('#p9m4-syntax')).toHaveText(/ladr_to_tptp/);
    await expect(page.locator('.p9m4-tabs button')).toHaveText(['FORMULAS', 'E OPTIONS', 'INPUT FILE']);
    expect(await runE(page)).toBe('SZS status Theorem.');
    // a problem of the user, checked by E
    await page.fill('#p9m4-tptp', 'fof(a, axiom, ![X]: (p(X) => q(X))).\nfof(b, axiom, p(c).');
    await page.getByRole('button', { name: 'WELL FORMED?' }).click();
    await expect(page.locator('#p9m4-syntax')).toHaveText(/^Line 2, column \d+ \(after '\.'\): Closing bracket/);
    const problem = 'fof(a, axiom, ![X]: (p(X) => q(X))).\nfof(b, axiom, p(c)).\nfof(g, conjecture, q(c)).\n';
    await page.fill('#p9m4-tptp', problem);
    await page.getByRole('button', { name: 'WELL FORMED?' }).click();
    await expect(page.locator('#p9m4-syntax')).toHaveText('The problem is well formed.');
    expect(await runE(page)).toBe('SZS status Theorem.');
    await page.getByRole('button', { name: 'INPUT FILE', exact: true }).click();
    await expect(page.locator('#p9m4-input-tptp')).toHaveText(problem);
    // saved with the options of E as a comment
    await page.getByRole('button', { name: 'E OPTIONS' }).click();
    await page.locator('.p9m4-groups button', { hasText: 'Basic' }).click();
    await page.locator('#p9m4-e-print-statistics').check();
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'SAVE INPUT FILE' }).click()]);
    expect(download.suggestedFilename()).toBe('problem.p');
    const saved = fs.readFileSync(await download.path(), 'utf8');
    expect(saved).toMatch(/^% LogicUS E options: .*--print-statistics/);
    expect(saved.endsWith(problem)).toBe(true);
    // loaded back in a new page, as it is
    await page.reload();
    await page.waitForFunction(() => typeof app !== 'undefined');
    await page.evaluate(() => { document.getElementById('popup').style.zIndex = 0; });
    await openPanel(page);
    await chooseProver(page, 'e');
    const file = testInfo.outputPath('saved.p');
    fs.writeFileSync(file, saved);
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'LOAD INPUT FILE' }).click()]);
    await chooser.setFiles(file);
    await expect(page.locator('#p9m4-file-message')).toHaveText('Read saved.p (TPTP, with options of E).');
    await expect(page.locator('#p9m4-tptp')).toHaveValue(problem);
    await page.getByRole('button', { name: 'E OPTIONS' }).click();
    await page.locator('.p9m4-groups button', { hasText: 'Basic' }).click();
    await expect(page.locator('#p9m4-e-print-statistics')).toBeChecked();
    // back to LADR: the empty formulas are filled with the translation of the problem
    await page.getByRole('button', { name: 'FORMULAS' }).click();
    await page.locator('.p9m4-elang input[value="ladr"]').check();
    await expect(page.locator('#p9m4-goals')).toHaveValue(/q\(c\)/);
    await expect(page.locator('#p9m4-syntax')).toHaveText(/tptp_to_ladr/);
    expect(await runE(page)).toBe('SZS status Theorem.');
    expect(problems).toEqual([]);
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
    // opened as a free problem, E keeps reading the TPTP of the node
    await page.evaluate(() => graph.getNodeById(5).widget3.callback());
    await expect(page.locator('pre.p9m4-input')).toContainText('fof(');
    const tptp = await page.locator('pre.p9m4-input').textContent();
    await page.getByRole('button', { name: 'OPEN AS A FREE PROBLEM' }).click();
    await expect(page.locator('.p9m4-systems input[value="e"]')).toBeChecked();
    await expect(page.locator('#p9m4-tptp')).toHaveValue(tptp);
    expect(await runE(page)).toBe('SZS status Theorem.');
    await page.getByRole('button', { name: 'CLOSE' }).click();
    const saved = await page.evaluate(() => JSON.stringify(graph.serialize()));
    await page.evaluate(s => loadSchema(JSON.parse(s)), saved);
    expect(await page.evaluate(() => graph.getNodeById(5).properties.p9m4.eprover)).toEqual(node.options);
    expect(problems).toEqual([]);
});
