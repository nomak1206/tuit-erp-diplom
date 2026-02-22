import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
    test('should load the main dashboard', async ({ page }) => {
        await page.goto('/');
        // Check for some known sidebar/header text to confirm the app loaded
        await expect(page.getByRole('heading', { name: 'CRM' })).toBeVisible({ timeout: 10000 });
    });
});
