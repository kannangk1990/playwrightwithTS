import { expect, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/header.component';
import { ProductCardComponent } from '../components/product-card.component';

export class InventoryPage {
  private readonly pageTitle;

  constructor(
    private readonly page: Page,
    private readonly header: HeaderComponent,
  ) {
    this.pageTitle = page.getByText('Products', { exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
  }

  async addProduct(name: string): Promise<void> {
    const products = this.page.locator('.inventory_item').filter({ hasText: name });
    await expect(products).toHaveCount(1);
    const product = products.first();
    await new ProductCardComponent(product).addToCart();
  }

  async expectCartCount(count: number): Promise<void> {
    await this.header.expectCartCount(count);
  }

  async openCart(): Promise<void> {
    await this.header.openCart();
  }
}
