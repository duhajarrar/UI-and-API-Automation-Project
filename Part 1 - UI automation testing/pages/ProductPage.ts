import { Page, Locator } from "@playwright/test";
import { SearchPage } from "./SearchPage";

export class ProductPage {
  readonly page: Page;
  readonly quantity: Locator;
  readonly increaseQuantity: Locator;
  readonly addToCartButton: Locator;
  readonly addedToCartMessage: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly productName: Locator;
  readonly brand: Locator;
  readonly category: Locator;

  constructor(page: Page) {
    this.page = page;
    this.quantity = page.getByTestId("quantity");
    this.increaseQuantity = page.getByTestId("increase-quantity");
    this.addToCartButton = page.getByTestId("add-to-cart");
    this.addedToCartMessage = page.getByRole("alert").filter({ hasText: "Product added to shopping cart." });
    this.cartBadge = page.getByTestId("cart-quantity");
    this.cartLink = page.getByTestId("nav-cart");
    this.productName = page.getByRole("heading", { level: 1 }); // the product name at the top of its page
    // The brand and category are shown in two badges labeled "brand" and "category"
    this.brand = page.getByLabel("brand", { exact: true });
    this.category = page.getByLabel("category", { exact: true });
  }

  // Product IDs can change when the demo resets, so we find products by name instead of by URL
  async open(productName: string) {
    const searchPage = new SearchPage(this.page);
    await searchPage.goto();
    await searchPage.searchFor(productName);
    await searchPage.productNames.and(this.page.getByText(productName, { exact: true })).click();
  }

  async addToCart(quantity = 1) {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
    await this.addedToCartMessage.first().waitFor();
  }
}