import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,

  // The demo site is public and sometimes slow. Cart and checkout tests go through many pages,
  // so we give each test 60 seconds and each check 10 seconds, instead of 30 and 5.
  timeout: 60_000,
  expect: { timeout: 10_000 },

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  // At most 3 browsers at the same time, so we don't overload the shared demo site (or the laptop)
  workers: process.env.CI ? 2 : 3,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }], // shown in GitLab's "Tests" tab
  ],

  use: {
    baseURL: "https://practicesoftwaretesting.com",
    // The site marks its elements with data-test="...", so getByTestId() reads that attribute
    testIdAttribute: "data-test",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // The site's Cloudflare protection stops headless browsers on cloud servers, so in CI the browser
    // runs headed inside a virtual display (xvfb-run in .gitlab-ci.yml). Locally it stays headless.
    headless: !process.env.CI,
  },

  projects: [
    // 1. Creates a test user, logs in once, and saves the session to playwright/.auth/user.json
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    // 2. All other tests start from the saved session (already logged in)
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});