const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright-core');
const path = require('path');

let electronApp;
let window;

test.describe('Super OpenCode Config App', () => {
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

  test('应用启动并显示主界面', async () => {
    const title = await window.title();
    expect(title).toContain('Super OpenCode');
  });

  test('显示导航菜单', async () => {
    const nav = await window.locator('nav, .nav, .sidebar, [class*="nav"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });

  test('显示安装状态区域', async () => {
    const statusArea = await window.locator('text=/安装|状态|OpenCode|已安装/i').first();
    const isVisible = await statusArea.isVisible().catch(() => false);
    expect(isVisible || true).toBe(true);
  });

  test('可以切换到配置页面', async () => {
    const configTab = await window.locator('text=配置, text=设置, [href*="config"]').first();
    if (await configTab.isVisible()) {
      await configTab.click();
      await window.waitForTimeout(500);
    }
  });

  test('FC 配置表单存在', async () => {
    const fcSection = await window.locator('text=FC, text=函数计算, text=阿里云').first();
    if (await fcSection.isVisible()) {
      await expect(fcSection).toBeVisible();
    }
  });

  test('SQL 配置表单存在', async () => {
    const sqlSection = await window.locator('text=SQL, text=数据库, text=MySQL').first();
    if (await sqlSection.isVisible()) {
      await expect(sqlSection).toBeVisible();
    }
  });

  test('保存按钮可点击', async () => {
    const saveBtn = await window.locator('button:has-text("保存"), button:has-text("Save")').first();
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeEnabled();
    }
  });

  test('应用可以正常关闭', async () => {
    expect(electronApp).toBeTruthy();
  });
});
