const { test, expect } = require('@playwright/test');

test.describe('{{APP_NAME}} E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('{{BASE_URL}}');
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Page Load', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/{{PAGE_TITLE}}/);
    });

    test('should display main navigation', async ({ page }) => {
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
    });

    test('should display main content area', async ({ page }) => {
      const main = page.locator('main, [role="main"], .main-content').first();
      await expect(main).toBeVisible();
    });
  });

  test.describe('User Flow: {{FLOW_NAME}}', () => {
    test('step 1: {{STEP_1_NAME}}', async ({ page }) => {
      await page.click('{{STEP_1_SELECTOR}}');
      await expect(page.locator('{{STEP_1_EXPECTED}}')).toBeVisible();
    });

    test('step 2: {{STEP_2_NAME}}', async ({ page }) => {
      await page.fill('{{STEP_2_INPUT_SELECTOR}}', '{{STEP_2_INPUT_VALUE}}');
      await page.click('{{STEP_2_SUBMIT_SELECTOR}}');
      await expect(page.locator('{{STEP_2_EXPECTED}}')).toBeVisible();
    });

    test('step 3: {{STEP_3_NAME}}', async ({ page }) => {
      await expect(page.locator('{{STEP_3_EXPECTED}}')).toContainText('{{STEP_3_TEXT}}');
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for empty required field', async ({ page }) => {
      await page.click('{{SUBMIT_BUTTON}}');
      await expect(page.locator('{{ERROR_MESSAGE_SELECTOR}}')).toBeVisible();
    });

    test('should show error for invalid input', async ({ page }) => {
      await page.fill('{{INPUT_SELECTOR}}', '{{INVALID_INPUT}}');
      await page.click('{{SUBMIT_BUTTON}}');
      await expect(page.locator('{{ERROR_MESSAGE_SELECTOR}}')).toBeVisible();
    });

    test('should submit successfully with valid input', async ({ page }) => {
      await page.fill('{{INPUT_SELECTOR}}', '{{VALID_INPUT}}');
      await page.click('{{SUBMIT_BUTTON}}');
      await expect(page.locator('{{SUCCESS_MESSAGE_SELECTOR}}')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('{{MOBILE_MENU_SELECTOR}}')).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('{{CONTENT_SELECTOR}}')).toBeVisible();
    });

    test('should display correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('{{SIDEBAR_SELECTOR}}')).toBeVisible();
    });
  });
});
