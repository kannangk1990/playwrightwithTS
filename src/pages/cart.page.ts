import { expect, type Page } from '@playwright/test';

export class CartPage {
  private readonly checkoutButton;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  async expectProduct(name: string): Promise<void> {
    await expect(this.page.locator('.cart_item')).toContainText(name);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
