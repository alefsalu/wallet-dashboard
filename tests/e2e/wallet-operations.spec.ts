import { test, expect } from '@playwright/test';

test.describe('Wallet Operations Flow', () => {
  test('executes deposit and displays updated balance', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'dev@wallet.local');
    await page.fill('#login-password', 'StrongPassw0rd123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);

    await page.click('button:has-text("Depositar")');
    await page.fill('#deposit-amount', '200.00');
    await page.click('button:has-text("Confirmar depósito")');

    await expect(page.locator('text=R$ 1.200,00')).toBeVisible();
  });
});
