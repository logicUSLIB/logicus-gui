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
    await expect(page.locator('#ded-hints-list')).toContainText('close the subproof 3-5 and apply →I 3-5: (p → r)');
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

test('the rules of the exercise can be switched off and chosen from the systems', async ({ page }) => {
    await openApp(page);
    await openPanel(page);
    await page.locator('#ded-premises').fill('¬¬p');
    await page.locator('#ded-goal').fill('p');
    await typeProof(page, '¬¬p   premise\np   ¬¬E 1');
    await expect(page.locator('.ded-status')).toHaveText('The proof is correct and complete.');
    // without ¬¬E
    await page.locator('.ded-rule', { hasText: '¬¬E' }).locator('input').uncheck();
    await expect(page.locator('.ded-table tr').nth(1)).toContainText('the rule ¬¬E is not one of the rules of this system');
    // the intuitionistic system has neither ¬¬E nor RAA
    await page.locator('#ded-preset').selectOption('Natural deduction (intuitionistic)');
    await expect(page.locator('.ded-rule', { hasText: 'RAA' })).toHaveCount(0);
    await expect(page.locator('.ded-status')).toHaveText('Wrong lines: 2.');
});

test('own rules and first-order proofs', async ({ page }) => {
    await openApp(page);
    await openPanel(page);
    await page.locator('#ded-lang').selectOption('FOL');
    await page.locator('#ded-premises').fill('!A[X](P(X) -> Q(X))\nP(a)');
    await page.locator('#ded-goal').fill('Q(a)');
    await page.locator('#ded-edit summary').click();
    await page.locator('#ded-rules-text').fill('rule ∀E : ∀x A ⊢ A[x/t]\nrule MP : A → B, A ⊢ B');
    await typeProof(page, '!A[X](P(X) -> Q(X))   premise\nP(a)   premise\nP(a) -> Q(a)   ∀E 1\nQ(a)   MP 3, 2');
    await expect(page.locator('.ded-status')).toHaveText('The proof is correct and complete.');
    await expect(page.locator('.ded-rule')).toHaveCount(2);
});
