import { test, expect } from '../src/fixtures/test';
import { CartPage } from '../src/pages/cart.page';
import { CheckoutPage } from '../src/pages/checkout.page';
import { InventoryPage } from '../src/pages/inventory.page';
import { HeaderComponent } from '../src/components/header.component';
import { checkoutInformation } from '../src/data/checkout';

test.describe('SauceDemo inventory checkout', { tag: ['@ui', '@smoke'] }, () => {
  test('checks out the first three products sorted by price', async ({ page }) => {
    await page.goto('/inventory.html');

    const header = new HeaderComponent(page);
    const inventoryPage = new InventoryPage(page, header);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const selectedProducts = await test.step('Sort inventory by price, low to high', async () => {
      await inventoryPage.expectLoaded();
      await inventoryPage.sortByPriceLowToHigh();

      const firstThreeProducts = await inventoryPage.getFirstProducts(3);
      const prices = firstThreeProducts.map((product) => product.price);
      expect(prices).toEqual([...prices].sort((first, second) => first - second));
      return firstThreeProducts;
    });

    await test.step('Add the first three sorted products to the cart', async () => {
      await inventoryPage.addFirstProductsToCart(3);
      await inventoryPage.expectCartCount(3);
    });

    await test.step('Verify cart count and product details in inventory order', async () => {
      await inventoryPage.openCart();
      await inventoryPage.expectCartCount(3);
      await cartPage.expectProducts(selectedProducts);
    });

    await test.step('Complete checkout and verify order confirmation', async () => {
      await cartPage.checkout();
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
