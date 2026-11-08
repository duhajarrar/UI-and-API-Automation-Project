import { Page, Locator } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly productTitles: Locator;
  readonly productPrice: Locator;
  readonly cartTotal: Locator;
  readonly emptyCartMessage: Locator;
  readonly quantityUpdatedMessage: Locator;
  readonly productDeletedMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productTitles = page.getByTestId("product-title");
    this.productPrice = page.getByTestId("product-price");
    this.cartTotal = page.getByTestId("cart-total");
    this.emptyCartMessage = page.getByText("The cart is empty");
    this.quantityUpdatedMessage = page.getByRole("alert").filter({ hasText: "Product quantity updated." });
    this.productDeletedMessage = page.getByRole("alert").filter({ hasText: "Product deleted." });
  }

  async goto() {
    await this.page.goto("/checkout");
  }

  // The table row of one product, matched by its exact name ("Pliers" must not match "Combination Pliers")
  productRow(productName: string): Locator {
    return this.page
      .getByRole("row")
      .filter({ has: this.productTitles.and(this.page.getByText(productName, { exact: true })) });
  }

  quantityOf(productName: string): Locator {
    return this.productRow(productName).getByTestId("product-quantity");
  }

  unitPriceOf(productName: string): Locator {
    return this.productRow(productName).getByTestId("product-price");
  }

  lineTotalOf(productName: string): Locator {
    return this.productRow(productName).getByTestId("line-price");
  }

  async updateQuantity(productName: string, quantity: number) {
    await this.quantityOf(productName).fill(String(quantity));
    await this.quantityOf(productName).press("Tab"); // the cart saves the new quantity when the field loses focus
  }

  async removeProduct(productName: string) {
    // The delete button is an icon with no text, label, or data-test, so find it by its style class
    await this.productRow(productName).locator(".btn-danger").click();
  }
}