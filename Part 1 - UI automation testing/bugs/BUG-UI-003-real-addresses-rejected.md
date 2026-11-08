# BUG-UI-003: Real billing addresses are rejected; only the site's generated addresses are accepted

| Priority | Severity | Status | Found by |
| --- | --- | --- | --- |
| **High** | High | Open | TC-CHECKOUT-08 |

## Description

At the **Billing Address** step, the site fills street, city, and state automatically from the postal code. But the address it fills in is **made up**, and the server then **only accepts that made-up address**. Any real address is rejected.

For example, postal code `10001` belongs to **New York, NY**. The site fills in **"Sporer Views, Gianniburgh, New Hampshire"**. If the customer corrects it to the real city, the order is rejected.

Because of this, a customer who types their real address can never complete an order (and with [BUG-UI-002](BUG-UI-002-order-fails-silently-after-payment-success.md), they don't even see why).

## Expected result

Real, correct addresses are accepted. The postal code lookup, if used, fills in the real city and state, and the customer can still edit them.

## Actual result

Every real address we tried was rejected by `POST /invoices` with **`422`** and the message *"The billing_country does not match the entered address. The city does not belong to the selected country."*:

| Country | Postal code | City | State | Result |
| --- | --- | --- | --- | --- |
| Palestine (PS) | 00970 | Ramallah | Ramallah and Al-Bireh | ❌ 422 |
| Palestine (PS) | 00970 | Nablus | Nablus | ❌ 422 |
| Palestine (PS) | 00970 | Gaza | Gaza | ❌ 422 |
| United States (US) | 10001 | New York | New York | ❌ 422 |
| United States (US) | 10001 | *Gianniburgh* (filled in by the site) | *New Hampshire* (filled in by the site) | ✅ accepted |

## Environment

| | |
| --- | --- |
| **Site** | Practice Software Testing – Toolshop: `https://practicesoftwaretesting.com` |
| **API** | `https://api.practicesoftwaretesting.com` (`GET /postcode-lookup`, `POST /invoices`) |
| **App version** | Toolshop v5.0 · front end v2.5, built 2026-10-11, Angular 20.0.5 (shown in the page footer) |
| **Browser** | Chromium (Playwright "Desktop Chrome", 1280×720) · also checked manually in Chrome DevTools |
| **Test tool** | Playwright with TypeScript |
| **OS** | Windows 11 |
| **Date found** | October 25, 2026 |

## Steps to reproduce

1. Log in, add a product to the cart, and go to checkout step 3, **Billing Address**.
2. Choose Country **United States**, Postal code `10001`, House number `5`.
3. See street, city, and state filled in automatically with a made-up address (for example "Gianniburgh, New Hampshire").
4. Change the city to **New York** and the state to **New York**. Continue.
5. Choose **Cash on Delivery**, click **Confirm** twice.
6. The order is not placed. DevTools → **Network** shows `POST /invoices → 422`.

## Verification: test that must pass once fixed

```bash
npx playwright test -g "TC-CHECKOUT-08"
```

The test places an order with a real address in Ramallah, Palestine. It's marked as a known bug with `test.fail(...)`. After the fix, remove that line from `tests/checkout.spec.ts`.

**Related:** [BUG-UI-002](BUG-UI-002-order-fails-silently-after-payment-success.md)
