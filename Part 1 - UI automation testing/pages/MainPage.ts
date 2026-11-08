import { Page, Locator } from "@playwright/test";

export class MainPage {
  readonly page: Page;
  readonly signInLink: Locator;
  readonly userMenu: Locator;
  readonly signOutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInLink = page.getByTestId("nav-sign-in");
    this.userMenu = page.getByTestId("nav-menu");
    this.signOutLink = page.getByTestId("nav-sign-out");
  }

  async gotoLoginPage() {
    await this.page.goto("/");
    await this.signInLink.click();
  }

  async signOut() {
    await this.userMenu.click();
    await this.signOutLink.click();
  }
}