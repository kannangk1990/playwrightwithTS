import { expect, type Page } from '@playwright/test';
import type { InventoryProductDetails } from './inventory.page';

export class CartPage {
  private readonly checkoutButton;
  private readonly cartItems;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.cartItems = page.getByTestId('cart-list').getByTestId('inventory-item');
  }

  async expectProduct(name: string): Promise<void> {
    await expect(this.page.locator('.cart_item')).toContainText(name);
  }

  async expectProducts(products: readonly InventoryProductDetails[]): Promise<void> {
    await expect(this.cartItems).toHaveCount(products.length);

    for (let index = 0; index < products.length; index++) {
      const cartItem = this.cartItems.nth(index);
      await expect(cartItem.getByTestId('inventory-item-name')).toHaveText(products[index].name);
      await expect(cartItem.getByTestId('inventory-item-desc')).toHaveText(products[index].description);
    }
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
