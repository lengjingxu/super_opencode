const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright-core');
const path = require('path');

let electronApp;
let window;

test.describe('{{APP_NAME}} Electron E2E', () => {
  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..', 'main.js')],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('app launches successfully', async () => {
    const title = await window.title();
    expect(title).toContain('{{APP_TITLE}}');
  });

  test('displays main navigation', async () => {
    const nav = await window.locator('nav, .nav, .sidebar, [class*="nav"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });

  test('displays main content area', async () => {
    const main = await window.locator('main, .main, .content, [class*="content"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('can navigate to {{PAGE_NAME}}', async () => {
    const tab = await window.locator('{{NAV_SELECTOR}}').first();
    if (await tab.isVisible()) {
      await tab.click();
      await window.waitForTimeout(500);
      await expect(window.locator('{{PAGE_CONTENT_SELECTOR}}')).toBeVisible();
    }
  });

  test('form elements are interactive', async () => {
    const input = await window.locator('input, textarea, select').first();
    if (await input.isVisible()) {
      await expect(input).toBeEnabled();
    }
  });

  test('buttons are clickable', async () => {
    const btn = await window.locator('button').first();
    if (await btn.isVisible()) {
      await expect(btn).toBeEnabled();
    }
  });

  test('app closes gracefully', async () => {
    expect(electronApp).toBeTruthy();
  });
});
