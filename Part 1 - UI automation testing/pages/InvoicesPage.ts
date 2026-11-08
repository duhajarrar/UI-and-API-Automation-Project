import { Page, Locator } from "@playwright/test";

export class InvoicesPage {
  readonly page: Page;
  readonly invoiceNumber: Locator;
  readonly total: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly country: Locator;
  readonly paymentMethod: Locator;

  constructor(page: Page) {
    this.page = page;
    // These are on the invoice details page
    this.invoiceNumber = page.getByTestId("invoice-number");
    this.total = page.getByTestId("total");
    this.street = page.getByTestId("street");
    this.city = page.getByTestId("city");
    this.country = page.getByTestId("country");
    this.paymentMethod = page.getByTestId("payment-method");
  }

  async goto() {
    await this.page.goto("/account/invoices");
  }

  // Several tests place orders with the same user, so we find the invoice by its number
  async openInvoice(invoiceNumber: string) {
    await this.page.getByRole("row").filter({ hasText: invoiceNumber }).getByRole("link", { name: "Details" }).click();
  }
}