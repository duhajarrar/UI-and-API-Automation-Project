import { test, expect } from "@playwright/test";
import { MainPage } from "../pages/MainPage";
import { LoginPage } from "../pages/LoginPage";
import { LOGIN_ERROR, accountURLRegex, loginURLRegex, rejectedByServer, rejectedByForm } from "../data/loginData";
import { readTestUser } from "../data/userFactory";

// readTestUser() returns the user created by auth.setup.ts for this run.
// It's called inside each test, because the setup creates the file only when the run starts.

// Login tests must start logged out, so they don't use the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login", () => {
  test("TC-LOGIN-01 Login with valid credentials", async ({ page }) => {
    const testUser = readTestUser();
    const mainPage = new MainPage(page);
    await mainPage.gotoLoginPage();

    const loginPage = new LoginPage(page);
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL(accountURLRegex);
    await expect(loginPage.pageTitle).toHaveText("My account");
    await expect(mainPage.userMenu).toBeVisible();
  });

  for (const data of rejectedByServer) {
    test(`${data.id} Login is rejected with ${data.title}`, async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.gotoLoginPage();

      const loginPage = new LoginPage(page);
      const email = data.email === "TEST_USER" ? readTestUser().email : data.email;
      await loginPage.login(email, data.password);

      await expect(loginPage.loginError).toHaveText(LOGIN_ERROR);
      await expect(page).toHaveURL(loginURLRegex);
    });
  }

  for (const data of rejectedByForm) {
    test(`${data.id} Login form shows an error for ${data.title}`, async ({ page }) => {
      const mainPage = new MainPage(page);
      await mainPage.gotoLoginPage();

      const loginPage = new LoginPage(page);
      await loginPage.login(data.email, data.password);

      const fieldError = data.field === "email" ? loginPage.emailError : loginPage.passwordError;
      await expect(fieldError).toHaveText(data.message);
      await expect(page).toHaveURL(loginURLRegex);
    });
  }

  test("TC-LOGIN-07 Password is hidden while typing", async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.gotoLoginPage();

    const loginPage = new LoginPage(page);
    await loginPage.password.fill("SecretPass123!");

    await expect(loginPage.password).toHaveAttribute("type", "password");
  });

  test("TC-LOGIN-08 Sign out ends the session", async ({ page }) => {
    const testUser = readTestUser();
    const mainPage = new MainPage(page);
    await mainPage.gotoLoginPage();

    const loginPage = new LoginPage(page);
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL(accountURLRegex);

    await mainPage.signOut();
    await expect(mainPage.signInLink).toBeVisible();

    // The account page must not open anymore
    await page.goto("/account");
    await expect(page).toHaveURL(loginURLRegex);
  });
});