import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
        await page.goto('/');

        // Fill in the login form
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin123');

        // Submit the form
        await page.click('button[type="submit"]');

        // Verify redirect to dashboard
        await expect(page.locator('h1').first()).toContainText(/Дашборд|Boshqaruv paneli|Dashboard/i, { timeout: 15000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/');

        await page.fill('input[name="username"]', 'wrong_user');
        await page.fill('input[name="password"]', 'wrong_pass');
        await page.click('button[type="submit"]');

        // Should display error message
        await expect(page.locator('text=Неверный логин')).toBeVisible({ timeout: 5000 });
    });
});
