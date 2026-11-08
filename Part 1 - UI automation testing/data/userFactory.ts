import fs from "fs";
import path from "path";

export type TestUser = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

// The setup saves the user it created here, so the login tests can use the same account
export const TEST_USER_FILE = "playwright/.auth/test-user.json";

/**
 * Builds a brand-new user with a unique email and a strong password.
 * A new user for every run means the tests don't depend on the demo's database resets,
 * on other people using the same account, or on accounts being locked.
 */
export function buildUser(): TestUser {
  const uniqueId = Date.now().toString(36);
  return {
    first_name: "Duha",
    last_name: "Tester",
    email: `qa.duha.${uniqueId}@example.com`,
    password: `Qa!${uniqueId}Xy9`,
  };
}

export function saveTestUser(user: TestUser) {
  // Create the folder first: on a fresh checkout, playwright/.auth doesn't exist yet
  fs.mkdirSync(path.dirname(TEST_USER_FILE), { recursive: true });
  fs.writeFileSync(TEST_USER_FILE, JSON.stringify(user, null, 2));
}

export function readTestUser(): TestUser {
  return JSON.parse(fs.readFileSync(TEST_USER_FILE, "utf-8"));
}