import { test as setup, expect } from "@playwright/test";
import { MainPage } from "../pages/MainPage";
import { LoginPage } from "../pages/LoginPage";
import { accountURLRegex } from "../data/loginData";
import { buildUser, saveTestUser } from "../data/userFactory";
import { registerUser } from "../api/userApi";

const authFile = "playwright/.auth/user.json";

// Runs once before the other tests:
// 1. creates a new user through the API,
// 2. logs in through the UI,
// 3. saves the session (the site keeps the login token in local storage, and storageState saves it).
setup("create a test user, log in, and save the session", async ({ page, request }) => {
  const user = buildUser();
  await registerUser(request, user);
  saveTestUser(user);

  const mainPage = new MainPage(page);
  await mainPage.gotoLoginPage();

  const loginPage = new LoginPage(page);
  await loginPage.login(user.email, user.password);
  await expect(page).toHaveURL(accountURLRegex);

  await page.context().storageState({ path: authFile });
});