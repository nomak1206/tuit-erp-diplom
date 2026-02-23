import { test, expect } from '@playwright/test';

test.describe('Full System Integration and UI Audit', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Authenticate and verify core Layout
        await page.goto('/');

        // Simulate Auto-login (dev mode bypass) or explicit login
        const loginButton = page.locator('button:has-text("Войти как Admin"), button:has-text("Admin sifatida kirish"), button:has-text("Login as Admin")');
        if (await loginButton.isVisible()) {
            await loginButton.click();
        }

        // Verify Dashboard loads (indicating successful backend auth cookie)
        await expect(page.locator('h1').first()).toContainText(/Дашборд|Boshqaruv paneli|Dashboard/i);
    });

    test('Module 1: CRM Hub - Leads and Deals Pipeline', async ({ page }) => {
        // Navigate to Leads
        await page.click('a[href="/crm/leads"]');
        await expect(page.locator('h1')).toContainText(/Лиды|Lidlar/i);
        // Verify Table renders data (at least headers and seeded rows)
        await expect(page.locator('table')).toBeVisible();

        // Navigate to Deals Kanban
        await page.click('a[href="/crm/deals"]');
        await expect(page.locator('h1')).toContainText(/Сделки|Kelishuvlar/i);
        // Verify Kanban columns loaded
        await expect(page.locator('.kanban-board')).toBeVisible();
        await expect(page.locator('.kanban-column')).toHaveCount(6);
    });

    test('Module 2: Warehouse - Inventory and Movements Validation', async ({ page }) => {
        // Navigate to Warehouse Movements
        await page.click('a[href="/warehouse"]'); // Expand menu
        await page.click('a[href="/warehouse/movements"]');
        await expect(page.locator('h1').first()).toContainText(/Движения|Harakatlar/i);

        // Check if the movements table fetches data successfully
        const table = page.locator('table');
        await expect(table).toBeVisible();

        // Attempt clicking 'New Movement' to verify form modal
        const newMovementBtn = page.locator('button:has-text("Новое движение"), button:has-text("Yangi harakat")');
        if (await newMovementBtn.isVisible()) {
            await newMovementBtn.click();
            await expect(page.locator('.ant-modal-content')).toBeVisible();
            await page.click('.ant-modal-close'); // close it
        }
    });

    test('Module 3: Accounting - Trial Balance & Journal Entries', async ({ page }) => {
        // Navigate to Trial Balance (OSV)
        await page.click('a[href="/accounting/trial-balance"]');
        await expect(page.locator('h1').first()).toContainText(/Оборотно-сальдовая|Aylanma qayd/i);

        // Wait for backend calculation to render the table and sum cards
        await expect(page.locator('.ant-statistic-content-value').first()).toBeVisible();
        await expect(page.locator('table')).toBeVisible();

        // Navigate to Journal
        await page.click('a[href="/accounting/journal"]');
        await expect(page.locator('h1').first()).toContainText(/Проводки|O\'tkazmalar/i);
        await expect(page.locator('table')).toBeVisible();
    });

    test('Module 4: HR & Payroll - Workforce rendering', async ({ page }) => {
        // Navigate to Employees
        await page.click('a[href="/hr/employees"]');
        await expect(page.locator('h1').first()).toContainText(/Сотрудники|Xodimlar/i);
        await expect(page.locator('table')).toBeVisible();

        // Navigate to Payroll
        await page.click('a[href="/hr/payroll"]');
        await expect(page.locator('h1').first()).toContainText(/Зарплата|Ish haqi/i);
        await expect(page.locator('table')).toBeVisible();
    });

    test('Module 5: Analytics & Global Features', async ({ page }) => {
        // Navigate to Analytics
        await page.click('a[href="/analytics"]');
        await expect(page.locator('h1').first()).toContainText(/Аналитика|Analitika/i);

        // Check if Recharts rendered the Canvas/SVG elements
        await expect(page.locator('.recharts-wrapper').first()).toBeVisible();

        // Test Language Switcher / Theme Toggle
        const headerIcons = page.locator('.ant-layout-header .ant-btn-icon-only');
        await expect(headerIcons.first()).toBeVisible();
    });

});
