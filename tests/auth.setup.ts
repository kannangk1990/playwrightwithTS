import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { environment } from '../src/config/env';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate standard user', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Username' }).fill(environment.sauceUsername);
  await page.getByRole('textbox', { name: 'Password' }).fill(environment.saucePassword);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Products', { exact: true })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
