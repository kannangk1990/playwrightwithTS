import { test as base } from '@playwright/test';
import { ApiClient } from '../api/api.client';
import { environment } from '../config/env';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';
import { HeaderComponent } from '../components/header.component';
import { standardUser } from '../data/users';

type AppFixtures = {
  apiClient: ApiClient;
  headerComponent: HeaderComponent;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authenticatedInventoryPage: InventoryPage;
};

export const test = base.extend<AppFixtures>({
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
});

export { expect } from '@playwright/test';
