import { expect, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/header.component';
import { ProductCardComponent } from '../components/product-card.component';

export type InventoryProductDetails = {
  name: string;
  description: string;
  price: number;
};

export class InventoryPage {
  private readonly pageTitle;
  private readonly inventoryItems;
  private readonly sortDropdown;

  constructor(
    private readonly page: Page,
    private readonly header: HeaderComponent,
  ) {
    this.pageTitle = page.getByText('Products', { exact: true });
    this.inventoryItems = page.getByTestId('inventory-list').getByTestId('inventory-item');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Products');
  }

  async sortByPriceLowToHigh(): Promise<void> {
    await this.sortDropdown.selectOption('lohi');
  }

  async getFirstProducts(count: number): Promise<InventoryProductDetails[]> {
    const itemCount = await this.inventoryItems.count();
    if (itemCount < count) {
      throw new Error(`Expected at least ${count} inventory items, but found ${itemCount}`);
    }

    const products: InventoryProductDetails[] = [];
    for (let index = 0; index < count; index++) {
      const item = this.inventoryItems.nth(index);
      const priceText = await item.getByTestId('inventory-item-price').innerText();
      products.push({
        name: await item.getByTestId('inventory-item-name').innerText(),
        description: await item.getByTestId('inventory-item-desc').innerText(),
        price: Number(priceText.replace('$', '')),
      });
    }
    return products;
  }

  async addFirstProductsToCart(count: number): Promise<void> {
    const itemCount = await this.inventoryItems.count();
    if (itemCount < count) {
      throw new Error(`Expected at least ${count} inventory items, but found ${itemCount}`);
    }

    for (let index = 0; index < count; index++) {
      await new ProductCardComponent(this.inventoryItems.nth(index)).addToCart();
    }
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
