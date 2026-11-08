# Toolshop E-commerce – UI Test Automation

Automated UI tests for an e-commerce website: **login**, **product search**, **shopping cart**, and **checkout**.

| | |
| --- | --- |
| **Website** | Practice Software Testing – Toolshop: https://practicesoftwaretesting.com |
| **Tools** | Playwright, TypeScript, Playwright HTML report |
| **Tests** | 35 test cases (+ 1 setup step) |
| **Bugs found** | [3](#bugs-found) |
| **Test cases and flows** | [docs/test-plan.md](docs/test-plan.md) |

## 1. Choosing the website

I first checked every site suggested in the task. None of them could be used at the time:

| Suggested site | Result | Reason |
| --- | --- | --- |
| LambdaTest Playground | ❌ | Down for everyone (connection timed out for hours, confirmed on downforeveryoneorjustme.com) |
| demo.opencart.com | ❌ | Cloudflare blocks automated browsers ("Just a moment..." page). I chose not to work around the site's protection |
| PrestaShop demo | ❌ | Returned `502 Bad Gateway` and was very slow |
| Demoblaze | ❌ | Has no product search, so "search by three criteria" isn't possible |

I chose **Toolshop** instead, because:

- its search filters **work together**: keyword + category + brand + price,
- it has a full shop: login, cart, and a 4-step checkout with several payment methods,
- it's built for test automation: elements have stable `data-test` attributes,
- it has an official API, used to create a fresh test user for every run.

Toolshop also has a version with intentionally planted bugs (`with-bugs.practicesoftwaretesting.com`). I tested the **normal** version on purpose, so every bug reported here is a real finding, not a planted one.

## 2. Test report

Latest full run: October 25, 2026 · **36 tests: 33 passed, 3 known bugs (expected to fail), 0 unexpected failures.**

**Legend:** ✅ Passed · ⚠️ Known bug (marked with `test.fail`, expected to fail)

The full report, with screenshots, videos, and traces for failed tests, opens with `npx playwright show-report`.

### Login – `tests/login.spec.ts`

| Test case | Description | Status | Bug (priority) |
| --- | --- | --- | --- |
| TC-LOGIN-01 | Login with valid credentials | ✅ | |
| TC-LOGIN-02 | Wrong password is rejected | ✅ | |
| TC-LOGIN-03 | Unregistered email is rejected | ✅ | |
| TC-LOGIN-04 | Empty email shows an error | ✅ | |
| TC-LOGIN-05 | Email without @ shows an error | ✅ | |
| TC-LOGIN-06 | Empty password shows an error | ✅ | |
| TC-LOGIN-07 | Password is hidden while typing | ✅ | |
| TC-LOGIN-08 | Sign out ends the session | ✅ | |

### Search – `tests/search.spec.ts`

The search tests don't depend on which products the shop has. For every result on the screen, they check that it follows every rule that was applied, then check that the screen shows exactly the products the server sent.

| Test case | Description | Status | Bug (priority) |
| --- | --- | --- | --- |
| TC-SEARCH-01 | Keyword only | ✅ | |
| TC-SEARCH-02 | Category only | ✅ | |
| TC-SEARCH-03 | Brand only | ✅ | |
| TC-SEARCH-04 | Keyword + brand | ✅ | |
| TC-SEARCH-05 | Keyword + category + brand (three criteria together) | ✅ | |
| TC-SEARCH-06 | Keyword + maximum price | ✅ | |
| TC-SEARCH-07 | Search is not case-sensitive | ✅ | |
| TC-SEARCH-08 | Unknown keyword shows a no-results message | ✅ | |
| TC-SEARCH-09 | Reset clears the search | ✅ | |
| TC-SEARCH-10 | Script in the search box is not run | ✅ | |

### Cart – `tests/cart.spec.ts`

| Test case | Description | Status | Bug (priority) |
| --- | --- | --- | --- |
| TC-CART-01 | Add a product to the cart | ✅ | |
| TC-CART-02 | Add a product with a chosen quantity | ✅ | |
| TC-CART-03 | Add two different products | ✅ | |
| TC-CART-04 | Line total and cart total are calculated correctly | ✅ | |
| TC-CART-05 | Change the quantity in the cart | ✅ | |
| TC-CART-06 | Remove a product | ✅ | |
| TC-CART-07 | Cart is kept after reloading the page | ✅ | |
| TC-CART-08 | Logged-in user's cart is kept in a new tab | ⚠️ | [BUG-UI-001](bugs/BUG-UI-001-cart-lost-in-new-tab.md) (Medium) |

### Checkout – `tests/checkout.spec.ts`

| Test case | Description | Status | Bug (priority) |
| --- | --- | --- | --- |
| TC-CHECKOUT-01 | Place an order with Cash on Delivery | ✅ | |
| TC-CHECKOUT-02 | Place an order with Credit Card | ✅ | |
| TC-CHECKOUT-03 | Logged-in user skips the sign-in step | ✅ | |
| TC-CHECKOUT-04 | Can't continue without a billing address | ✅ | |
| TC-CHECKOUT-05 | Can't confirm without choosing a payment method | ✅ | |
| TC-CHECKOUT-06 | Invalid card number shows an error | ✅ | |
| TC-CHECKOUT-07 | Invoice shows the order's total and billing address | ✅ | |
| TC-CHECKOUT-08 | Place an order with a real address | ⚠️ | [BUG-UI-003](bugs/BUG-UI-003-real-addresses-rejected.md) (High) |
| TC-CHECKOUT-09 | A rejected order shows an error message | ⚠️ | [BUG-UI-002](bugs/BUG-UI-002-order-fails-silently-after-payment-success.md) (High) |

## Bugs found

| Bug | Summary | Priority | Tests |
| --- | --- | --- | --- |
| [BUG-UI-001](bugs/BUG-UI-001-cart-lost-in-new-tab.md) | A logged-in user's cart is lost when the shop is opened in a new tab | Medium | TC-CART-08 |
| [BUG-UI-002](bugs/BUG-UI-002-order-fails-silently-after-payment-success.md) | Order fails silently after "Payment was successful", with no error shown | **High** | TC-CHECKOUT-09 |
| [BUG-UI-003](bugs/BUG-UI-003-real-addresses-rejected.md) | Real billing addresses are rejected; only the site's generated addresses are accepted | **High** | TC-CHECKOUT-08 |

**How known bugs are handled:** their tests stay in the suite, marked with `test.fail(true, "BUG-UI-00X: ...")`. The run stays green and the report shows the bug ID. When a bug is fixed, its test starts passing, Playwright reports that as a failure, and that's the reminder to remove the mark and close the bug.

## 3. Setup and run

### Requirements

- Node.js 18 or newer

No account or password is needed: the tests create their own user for every run.

### Install

```bash
cd "Part 1 - UI automation testing"
npm install
npx playwright install chromium
```

### Run

| Command | What it does |
| --- | --- |
| `npx playwright test` | Runs all tests |
| `npx playwright show-report` | Opens the HTML report of the last run |
| `npx playwright test tests/cart.spec.ts` | Runs one file |
| `npx playwright test -g "TC-SEARCH-05"` | Runs one test by its ID |
| `npx playwright test --ui` | Opens Playwright's UI mode to watch and debug tests |
| `npx playwright test --headed` | Runs with the browser visible |

### Run in GitLab CI

The pipeline (`.gitlab-ci.yml` in the repository root) runs the tests on every push. Results appear in the pipeline's **Tests** tab, and the HTML report is kept as a job artifact (`playwright-report/index.html`).

## 4. How the project works

### Structure

```
├── pages/              Page Objects: the fields, buttons, and actions of each page
│   ├── MainPage.ts       header: sign in, user menu, sign out
│   ├── LoginPage.ts
│   ├── SearchPage.ts     search box, category and brand filters, price slider
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts   the 4 checkout steps
│   └── InvoicesPage.ts
├── tests/              One file per feature, plus auth.setup.ts
├── data/               Test data and data-driven test tables
├── api/                Creates the test user through the site's API
├── utils/              Small helpers (prices)
├── bugs/               One file per bug, with screenshots and videos in bugs/images/
├── docs/test-plan.md   Test flows and test cases
└── playwright.config.ts
```

### Design decisions

- **A new user for every run.** `tests/auth.setup.ts` creates a user through the site's official API (`POST /users/register`), logs in through the UI, and saves the session. The demo database is reset regularly, and shared demo accounts can be changed or locked by other people, so the tests never depend on them.
- **Logged in once (storage state).** Search, cart, and checkout tests start from the saved session. Login tests start logged out on purpose.
- **Cart tests can run in parallel.** The site keeps the cart in each browser tab's session storage, so every test starts with its own empty cart.
- **Page Object Model.** If the site changes, the fix is in one place.
- **`data-test` locators.** `testIdAttribute: "data-test"` in the config makes `getByTestId()` read the site's own test attributes.
- **Data-driven tests.** Login errors, search combinations, and payment methods are tables in `data/`.
- **Search tests are generic.** They don't list expected products. In this order, they check that:
  1. every product on the screen follows every filter (name contains the keyword; brand and category are read from each product's page; price is under the maximum),
  2. the screen shows exactly the products the server sent: nothing missing, extra, or duplicated.

  Whether the server picked the right products is the job of the API tests. The UI tests check that the screen shows them correctly.
- **No fixed waits.** Assertions like `toHaveText()` retry until the page updates.
- **Products found by name.** Product IDs change after a reset, so tests search for products by name.
- **Waiting for the server, not the clock.** Every search and filter waits for the products response from the API. Note: the site asks for products with the new HTTP method `QUERY`, not `GET`, so the tests match any method except the `OPTIONS` preflight.
- **Price slider moved with the keyboard.** Each ArrowLeft press lowers the maximum by exactly $1, so the slider lands on the exact price. Dragging with the mouse isn't pixel-perfect.
- **Timeouts and workers for a shared demo site.** Each test gets 60 seconds and each check 10 seconds, and at most 3 tests run at the same time. A test should fail because of a bug, not because the public demo had a slow moment.