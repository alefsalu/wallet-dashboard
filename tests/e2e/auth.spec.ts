import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('logs in successfully and navigates to dashboard with balance visible', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'dev@wallet.local');
    await page.fill('#login-password', 'StrongPassw0rd123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=R$ 1.000,00').first()).toBeVisible();
  });
});
