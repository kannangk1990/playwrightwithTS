import fs from 'fs';
import { test as base, expect, Page, TestInfo } from '@playwright/test';
import { ApiClient } from '../api/api.client';
import { environment } from '../config/env';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';
import { HeaderComponent } from '../components/header.component';
import { standardUser } from '../data/users';
import { allure } from 'allure-playwright';

type AppFixtures = {
  apiClient: ApiClient;
  headerComponent: HeaderComponent;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authenticatedInventoryPage: InventoryPage;
};

// Extend AppFixtures with internal console log collector
export const test = base.extend<AppFixtures & { _consoleLogs: string[] }>({
  apiClient: async ({ playwright }, use) => {
    const apiRequest = await playwright.request.newContext({
      baseURL: environment.apiBaseUrl,
      timeout: 15_000,
      extraHTTPHeaders: { Accept: 'application/json' },
    });

    await use(new ApiClient(apiRequest));
    await apiRequest.dispose();
  },
  headerComponent: async ({ page }, use) => use(new HeaderComponent(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page, headerComponent }, use) => use(new InventoryPage(page, headerComponent)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  authenticatedInventoryPage: async ({ page, loginPage, inventoryPage }, use) => {
    await page.goto('/');
    if (await page.getByRole('textbox', { name: 'Username' }).isVisible()) {
      await loginPage.login(standardUser.username, standardUser.password);
    }
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },

  // internal fixture: collect console logs for attaching on failure
  _consoleLogs: async ({ page }, use) => {
    const logs: string[] = [];
    page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
    await use(logs);
  },
});

// Global afterEach: attach artifacts for failed tests to Allure
test.afterEach(async ({ page, _consoleLogs }, testInfo: TestInfo) => {
  try {
    if (testInfo.status !== 'passed') {
      // Screenshot
      try {
        const screenshot = await page.screenshot();
        allure.attachment('screenshot', screenshot, 'image/png');
      } catch (e) {
        // ignore screenshot errors
      }

      // Page source
      try {
        const html = await page.content();
        allure.attachment('page-source', html, 'text/html');
      } catch (e) {}

      // Console logs
      try {
        if (_consoleLogs && _consoleLogs.length) {
          allure.attachment('console-logs', _consoleLogs.join('\n'), 'text/plain');
        }
      } catch (e) {}

      // Attach any Playwright attachments (video/trace) that have paths
      try {
        for (const a of testInfo.attachments) {
          if (a.path && fs.existsSync(a.path)) {
            const data = fs.readFileSync(a.path);
            const name = a.name || 'attachment';
            const contentType = a.contentType || 'application/octet-stream';
            allure.attachment(name, data, contentType);
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    console.warn('afterEach hook failed:', err);
  }
});

export { expect } from '@playwright/test';
