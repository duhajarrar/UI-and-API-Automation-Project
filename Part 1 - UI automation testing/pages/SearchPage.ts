import { Page, Locator, Response, expect } from "@playwright/test";

// The part of the API answer we use: the products the server sent for the current page
export type ProductsResponse = {
  data: { name: string }[];
  total: number;
  last_page: number;
};

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly searchCaption: Locator;
  readonly resultCount: Locator;
  readonly noResults: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly maxPriceHandle: Locator;
  // The last list of products the server sent to the page (filled after every search or filter)
  lastResults: ProductsResponse = { data: [], total: 0, last_page: 1 };

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId("search-query");
    this.searchButton = page.getByTestId("search-submit");
    this.resetButton = page.getByTestId("search-reset");
    this.searchCaption = page.getByTestId("search-caption");
    this.resultCount = page.getByTestId("search-result-count");
    this.noResults = page.getByTestId("no-results");
    this.productCards = page.locator('a[data-test^="product-"]');
    this.productNames = page.getByTestId("product-name");
    this.productPrices = page.getByTestId("product-price");
    this.maxPriceHandle = page.locator(".ngx-slider-pointer-max");
  }

  async goto() {
    await this.page.goto("/");
    await this.productNames.first().waitFor();
  }

  // Every search and every filter asks the API for products.
  // We wait for that answer, so we never read the old list, and we keep it to compare with the screen.
  // Note: the site asks for products with the new HTTP method QUERY, not GET.
  // The browser first sends an OPTIONS "preflight" request, which has no products, so we skip it.
  private waitForResults(): Promise<Response> {
    return this.page.waitForResponse(
      (response) => response.url().includes("api.practicesoftwaretesting.com/products") && response.request().method() !== "OPTIONS",
    );
  }

  private async saveResults(response: Promise<Response>) {
    this.lastResults = await (await response).json();
  }

  // Criteria 1: keyword
  async searchFor(keyword: string) {
    const resultsLoaded = this.waitForResults();
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.saveResults(resultsLoaded);
  }

  // Criteria 2: category (a checkbox in the filters, found by its label)
  async filterByCategory(category: string) {
    const resultsLoaded = this.waitForResults();
    await this.page.getByLabel(category, { exact: true }).check();
    await this.saveResults(resultsLoaded);
  }

  // Criteria 3: brand (a checkbox in the filters, found by its label)
  async filterByBrand(brand: string) {
    const resultsLoaded = this.waitForResults();
    await this.page.getByLabel(brand, { exact: true }).check();
    await this.saveResults(resultsLoaded);
  }

  // Criteria 4: price. We move the slider's max handle with the keyboard:
  // every ArrowLeft press lowers it by exactly $1, so it lands on the exact price (dragging with the mouse doesn't).
  async setMaxPrice(maxPrice: number) {
    const currentMax = await this.getMaxPrice();
    await this.maxPriceHandle.focus();
    for (let price = currentMax; price > maxPrice; price--) {
      await this.page.keyboard.press("ArrowLeft");
    }
    await expect(this.maxPriceHandle).toHaveAttribute("aria-valuenow", String(maxPrice));
  }

  async getMaxPrice(): Promise<number> {
    return Number(await this.maxPriceHandle.getAttribute("aria-valuenow"));
  }

  // The names the server sent, in the same order
  getExpectedNames(): string[] {
    return this.lastResults.data.map((product) => product.name);
  }

  async getProductNames(): Promise<string[]> {
    return await this.productNames.allInnerTexts();
  }

  async getProductPrices(): Promise<number[]> {
    const prices = await this.productPrices.allInnerTexts();
    return prices.map((price) => Number(price.replace(/[^0-9.]/g, "")));
  }

  // The link of every result, so we can open each product and check its brand and category
  async getProductLinks(): Promise<string[]> {
    const links: string[] = [];
    for (const card of await this.productCards.all()) {
      links.push((await card.getAttribute("href")) ?? "");
    }
    return links;
  }
}