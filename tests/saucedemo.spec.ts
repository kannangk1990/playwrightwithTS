import { expect } from '@playwright/test';
import { test } from '../src/fixtures/test';

test.describe('SauceDemo authenticated UI', { tag: ['@ui', '@smoke'] }, () => {
  test('starts on the inventory page with the saved session', async ({ page }) => {
    await page.goto('/inventory.html');

    await expect(page.getByText('Products', { exact: true })).toBeVisible();
    await expect(page.getByTestId('inventory-list')).toBeVisible();
  });

  test('can add a product to the cart using the saved session', async ({ page }) => {
    await page.goto('/inventory.html');
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
  });
});
