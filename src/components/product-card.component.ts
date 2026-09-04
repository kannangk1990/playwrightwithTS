import { expect, type Locator } from '@playwright/test';

export class ProductCardComponent {
  private readonly productName;
  private readonly addToCartButton;

  constructor(private readonly root: Locator) {
    this.productName = root.getByRole('link').first();
    this.addToCartButton = root.getByRole('button', { name: /add to cart/i });
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async expectName(name: string): Promise<void> {
    await expect(this.productName).toHaveText(name);
  }
}
