import { APIRequestContext, expect } from "@playwright/test";
import { TestUser } from "../data/userFactory";

const API_URL = "https://api.practicesoftwaretesting.com";

// Creates the account through the site's official API (documented in its Swagger),
// which is faster and more stable than filling the registration form in the browser.
export async function registerUser(request: APIRequestContext, user: TestUser) {
  const response = await request.post(`${API_URL}/users/register`, { data: user });
  expect(response.status(), `Registration failed: ${await response.text()}`).toBe(201);
}