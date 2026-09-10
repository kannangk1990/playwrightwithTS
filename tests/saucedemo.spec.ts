import * as allure from 'allure-js-commons';
import { test } from '../src/fixtures/test';
import { checkoutInformation } from '../src/data/checkout';

test.describe('Sauce Demo shopping journey', { tag: ['@smoke', '@ui'] }, () => {
  test.beforeEach(async () => {
    await allure.epic('E-commerce');
  });

  test('standard user can add a backpack to the cart', async ({ authenticatedInventoryPage, cartPage }) => {
    await allure.feature('Shopping cart');
    await allure.story('Add a product to the cart');
    await allure.severity('normal');

    await test.step('Add the backpack to the cart', async () => {
      await authenticatedInventoryPage.addProduct('Sauce Labs Backpack');
      await authenticatedInventoryPage.expectCartCount(1);
    });

    await test.step('Verify the cart contents', async () => {
      await authenticatedInventoryPage.openCart();
      await cartPage.expectProduct('Sauce Labs Backpack');
    });
  });

  test('user can complete a purchase', async ({ authenticatedInventoryPage, cartPage, checkoutPage }) => {
    await allure.feature('Checkout');
    await allure.story('Complete a purchase');
    await allure.severity('critical');

    await test.step('Add a product to the cart', async () => {
      await authenticatedInventoryPage.addProduct('Sauce Labs Backpack');
      await authenticatedInventoryPage.expectCartCount(1);
      await authenticatedInventoryPage.openCart();
    });

    await test.step('Review the cart', async () => {
      await cartPage.expectProduct('Sauce Labs Backpack');
      await cartPage.checkout();
    });

    await test.step('Complete checkout', async () => {
      await checkoutPage.completeInformation(
        checkoutInformation.firstName,
        checkoutInformation.lastName,
        checkoutInformation.postalCode,
      );
      await checkoutPage.finishOrder();
      await checkoutPage.expectOrderComplete();
    });
  });
});

test.describe('Authentication', { tag: ['@ui', '@regression'] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('blocked user sees a login error', async ({ loginPage }) => {
    await allure.feature('Authentication');
    await allure.story('Reject a locked account');
    await loginPage.open();
    await loginPage.login('locked_out_user', 'secret_sauce');
    await loginPage.expectLoginError(/locked out/i);
  });
});
