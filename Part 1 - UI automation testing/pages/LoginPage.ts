import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByTestId("email");
    this.password = page.getByTestId("password");
    this.loginButton = page.getByTestId("login-submit");
    this.loginError = page.getByTestId("login-error");
    this.emailError = page.getByTestId("email-error");
    this.passwordError = page.getByTestId("password-error");
    this.pageTitle = page.getByTestId("page-title");
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}