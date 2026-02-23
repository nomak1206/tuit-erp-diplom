import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
    test('should login and load the main dashboard', async ({ page }) => {
        // Visit the base URL (which redirects to /login if unauthenticated)
        await page.goto('/');

        // Wait for the login button to appear
        const loginBtn = page.getByRole('button');
        await loginBtn.waitFor({ state: 'visible', timeout: 10000 });

        // Click the auto-login button
        await loginBtn.click();

        // Check for some known sidebar/header text to confirm the app loaded and redirected
        await expect(page.getByRole('heading', { name: 'CRM' })).toBeVisible({ timeout: 15000 });
    });
});
