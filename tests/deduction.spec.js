// The DEDUCTION panel: proofs checked with the rules of the exercise, and the rules that can be used.
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

async function openPanel(page) {
    await page.evaluate(() => openDEDUCTIONPANEL());
    await expect(page.locator('.ded-status')).toBeVisible();
}

async function typeProof(page, text) {
    await page.locator('#ded-proof').fill(text);
    await page.getByRole('button', { name: 'CHECK' }).click();
}

test('the example proof is checked and completed with the hints', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await expect(page.locator('.ded-status')).toHaveText('Every line is correct, but the proof ends inside a subproof.');
    await expect(page.locator('.ded-table tr')).toHaveCount(4);
    await page.getByRole('button', { name: 'RULES THAT CAN BE USED' }).click();
    await expect(page.locator('#ded-hints-list')).toContainText('→E 2, 4 gives r');
    await page.locator('#ded-hints-list button', { hasText: 'ADD' }).first().click();
    await expect(page.locator('#ded-hints-list')).toContainText('close the subproof 3-5 and apply →I 3-5: p → r');
    await page.locator('#ded-hints-list button', { hasText: 'ADD' }).first().click();
    await expect(page.locator('.ded-status')).toHaveText('The proof is correct and complete.');
    expect(problems).toEqual([]);
});

test('each wrong line says why', async ({ page }) => {
    await openApp(page);
    await openPanel(page);
    await typeProof(page, 'p -> q   premise\nq -> r   premise\n| p   assumption\n| r   ->E 2, 3\np -> r   ->I 3-4\nq   ->E 1, 3');
    await expect(page.locator('.ded-status')).toHaveText('Wrong lines: 4, 6.');
    await expect(page.locator('.ded-table tr').nth(3)).toContainText('→E (A → B, A ⊢ B) does not give this formula from 2, 3');
    await expect(page.locator('.ded-table tr').nth(5)).toContainText('line 3 is inside a closed subproof');
});

async function editRules(page) {
    await page.getByRole('button', { name: 'EDIT' }).click();
    await expect(page.locator('#ded-rules-text')).toBeVisible();
}

async function saveRules(page) {
    await page.getByRole('button', { name: 'SAVE', exact: true }).click();
}

function ruleButtons(page) {
    return page.locator('.ded-rule-button');
}

test('the rules of the exercise are switched off and chosen from the systems in EDIT, and change on SAVE', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await page.locator('#ded-premises').fill('¬¬p');
    await page.locator('#ded-goal').fill('p');
    await typeProof(page, '¬¬p   premise\np   ¬¬E 1');
    await expect(page.locator('.ded-status')).toHaveText('The proof is correct and complete.');
    await expect(ruleButtons(page).filter({ hasText: /^¬¬E$/ })).toHaveCount(1);
    // without ¬¬E: nothing changes until SAVE
    await editRules(page);
    await page.locator('.ded-rule', { hasText: '¬¬E' }).locator('input').uncheck();
    await expect(page.locator('.ded-status')).toHaveText('The proof is correct and complete.');
    await saveRules(page);
    await expect(page.locator('#ded-rules-text')).toHaveCount(0);
    await expect(ruleButtons(page).filter({ hasText: /^¬¬E$/ })).toHaveCount(0);
    await expect(page.locator('.ded-table tr').nth(1)).toContainText('the rule ¬¬E is not one of the rules of this system');
    // the intuitionistic system has neither ¬¬E nor RAA
    await editRules(page);
    await page.locator('#ded-preset').selectOption('Natural deduction (intuitionistic)');
    await saveRules(page);
    await expect(page.locator('.ded-system-name')).toHaveText('Natural deduction (intuitionistic)');
    await expect(ruleButtons(page).filter({ hasText: /^RAA$/ })).toHaveCount(0);
    await expect(ruleButtons(page).filter({ hasText: /^→I$/ })).toHaveCount(1);
    await expect(page.locator('.ded-status')).toHaveText('Wrong lines: 2.');
    // CANCEL leaves the rules as they were
    await editRules(page);
    await page.locator('#ded-preset').selectOption('Axiomatic system');
    await page.getByRole('button', { name: 'CANCEL' }).click();
    await expect(page.locator('.ded-system-name')).toHaveText('Natural deduction (intuitionistic)');
    expect(problems).toEqual([]);
});

test('own rules and first-order proofs', async ({ page }) => {
    await openApp(page);
    await openPanel(page);
    await page.locator('#ded-lang').selectOption('FOL');
    await page.locator('#ded-premises').fill('!A[X](P(X) -> Q(X))\nP(a)');
    await page.locator('#ded-goal').fill('Q(a)');
    await editRules(page);
    await page.locator('#ded-rules-text').fill('rule ∀E : ∀x A ⊢ A[x/t]\nrule MP : A → B, A ⊢ B');
    await expect(page.locator('#ded-preset')).toHaveValue('Own rules');
    await saveRules(page);
    await typeProof(page, '!A[X](P(X) -> Q(X))   premise\nP(a)   premise\nP(a) -> Q(a)   ∀E 1\nQ(a)   MP 3, 2');
    await expect(page.locator('.ded-status')).toHaveText('The proof is correct and complete.');
    await expect(ruleButtons(page)).toHaveText(['∀E', 'MP']);
    await expect(page.locator('.ded-system-name')).toHaveText('Own rules');
});

test('the systems follow the language; SAVE checks the rules, and a rule that is not valid is marked', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await expect(ruleButtons(page).filter({ hasText: /^¬¬E$/ })).toHaveCount(1);
    await expect(ruleButtons(page).filter({ hasText: /^∀E$/ })).toHaveCount(0);
    // the same system in first-order logic, with the rules of the quantifiers and equality
    await page.locator('#ded-lang').selectOption('FOL');
    await expect(ruleButtons(page).filter({ hasText: /^∀E$/ })).toHaveCount(1);
    await expect(page.locator('.ded-system-name')).toHaveText('Natural deduction (classical)');
    await page.locator('#ded-lang').selectOption('PL');
    await expect(ruleButtons(page).filter({ hasText: /^∀E$/ })).toHaveCount(0);
    // own rules: a rule that is not valid is saved, with a counterexample
    await editRules(page);
    await page.locator('#ded-rules-text').fill('rule →E : A → B, A ⊢ B\nrule bad : A → B, B ⊢ A');
    await saveRules(page);
    const bad = ruleButtons(page).filter({ hasText: 'bad' });
    await expect(bad).toHaveText('bad ⚠');
    await expect(bad).toHaveAttribute('title', /A false, B true/);
    await expect(ruleButtons(page).filter({ hasText: '→E' })).not.toHaveClass(/warn/);
    // the rules of first-order logic are not propositional: the editor stays open and nothing changes
    await editRules(page);
    await page.locator('#ded-rules-text').fill('rule ∀E : ∀x A ⊢ A[x/t]');
    await saveRules(page);
    await expect(page.locator('#ded-draft-error')).toContainText('quantifiers are not propositional');
    await expect(page.locator('#ded-rules-text')).toBeVisible();
    // two rules with the same name
    await page.locator('#ded-rules-text').fill('rule R : A ⊢ A\nrule r : A ⊢ A');
    await saveRules(page);
    await expect(page.locator('#ded-draft-error')).toHaveText('The rules cannot be saved: two rules are called r');
    await page.getByRole('button', { name: 'CANCEL' }).click();
    await expect(ruleButtons(page)).toHaveText(['→E', 'bad ⚠']);
    expect(problems).toEqual([]);
});

test('a rule is clicked to add a line with it, which is then completed', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    // the example: p → q, q → r ⊢ p → r, with the subproof open at line 4
    await ruleButtons(page).filter({ hasText: /^→E$/ }).click();
    await expect(page.locator('#ded-gutter div')).toHaveText(['1', '2', '3', '4', '5']);
    await page.keyboard.type('r');
    await page.keyboard.press('End');
    await page.keyboard.type('2, 4');
    // →I closes the subproof: one bar less
    await ruleButtons(page).filter({ hasText: /^→I$/ }).click();
    await page.keyboard.type('p -> r');
    await page.keyboard.press('End');
    await page.keyboard.type('3-5');
    await expect(page.locator('#ded-proof')).toHaveValue(/\| r +→E 2, 4\np -> r +→I 3-5$/);
    await expect(page.locator('.ded-status')).toHaveText('The proof is correct and complete.');
    // after the line of the cursor: a line with R after line 1, at its depth
    await page.locator('#ded-proof').fill('p -> q   premise\nq -> r   premise');
    await page.locator('#ded-proof').evaluate(t => { t.focus(); t.setSelectionRange(5, 5); });
    await ruleButtons(page).filter({ hasText: /^R$/ }).click();
    await page.keyboard.type('p -> q');
    await page.keyboard.press('End');
    await page.keyboard.type('1');
    await expect(page.locator('#ded-proof')).toHaveValue(/^p -> q   premise\np -> q +R 1\nq -> r   premise$/);
    await expect(page.locator('.ded-table tr').nth(1)).toHaveClass(/ok/);
    expect(problems).toEqual([]);
});

test('the lines of the proof are numbered as the rules cite them', async ({ page }) => {
    const problems = await openApp(page);
    await openPanel(page);
    await typeProof(page, 'p -> q   premise\nq -> r   premise\n\n| p   assumption\n| r   ->E 2, 3\n');
    // the empty line is not counted, and the wrong line is marked once checked
    await expect(page.locator('#ded-gutter div')).toHaveText(['1', '2', '', '3', '4', '']);
    await expect(page.locator('#ded-gutter .bad')).toHaveText(['4']);
    await expect(page.locator('.ded-table tr').nth(3)).toContainText('→E (A → B, A ⊢ B) does not give this formula from 2, 3');
    // a line added from the hints gets its number
    await page.locator('#ded-proof').fill('p -> q   premise\nq -> r   premise\n| p   assumption\n');
    await page.getByRole('button', { name: 'RULES THAT CAN BE USED' }).click();
    await page.locator('#ded-hints-list .ded-item', { hasText: '→E 1, 3 gives q' }).locator('button', { hasText: 'ADD' }).click();
    await expect(page.locator('#ded-gutter div')).toHaveText(['1', '2', '3', '4', '']);
    await expect(page.locator('#ded-gutter .bad')).toHaveCount(0);
    expect(problems).toEqual([]);
});
