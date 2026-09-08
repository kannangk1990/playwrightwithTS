import fs from 'fs';
import { test as base, expect, Page, TestInfo } from '@playwright/test';
import { allure } from 'allure-playwright';

type MyFixtures = {
  page: Page;
  _consoleLogs: string[];
};

export const test = base.extend<MyFixtures>({
  _consoleLogs: async ({ page }, use) => {
    const logs: string[] = [];
    page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
    await use(logs);
  },
});

// Global afterEach: attach artifacts for failed tests
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
            // map common attachment names/content types
            const name = a.name || 'attachment';
            const contentType = a.contentType || 'application/octet-stream';
            allure.attachment(name, data, contentType);
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    // never throw from hook
    console.warn('afterEach hook failed:', err);
  }
});

export { expect };