import { test, expect } from "@playwright/test";
import { ProductPage } from "../pages/ProductPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { InvoicesPage } from "../pages/InvoicesPage";
import { combinationPliers } from "../data/cartData";
import { lookupAddress, realAddress, paymentMethods, invalidCard, ORDER_SUCCESS_REGEX } from "../data/checkoutData";

// Checkout tests use the saved logged-in session. The cart lives in each tab's session storage,
// so every test starts with its own empty cart and adds one product first.

test.describe("Checkout", () => {
  test.beforeEach(async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart();
  });

  for (const data of paymentMethods) {
    test(`${data.id} Place an order with ${data.title}`, async ({ page }) => {
      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.startCheckout();
      await checkoutPage.fillBillingAddress(lookupAddress);
      await checkoutPage.proceedToPayment.click();

      await checkoutPage.choosePaymentMethod(data.method);
      if (data.card) await checkoutPage.fillCreditCard(data.card);
      await checkoutPage.confirmPayment();
      await expect(checkoutPage.paymentSuccessMessage).toHaveText("Payment was successful");

      await checkoutPage.placeOrder();
      await expect(checkoutPage.orderConfirmation).toHaveText(ORDER_SUCCESS_REGEX);

      // The cart is empty after the order
      const productPage = new ProductPage(page);
      await expect(productPage.cartLink).toBeHidden();
    });
  }

  test("TC-CHECKOUT-03 Logged-in user skips the sign-in step", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await page.goto("/checkout");
    await checkoutPage.proceedFromCart.click();

    await expect(checkoutPage.alreadyLoggedInMessage).toBeVisible();
    await expect(checkoutPage.proceedFromSignIn).toBeEnabled();
  });

  test("TC-CHECKOUT-04 Can't continue without a billing address", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.startCheckout();

    await expect(checkoutPage.proceedToPayment).toBeDisabled();
  });

  test("TC-CHECKOUT-05 Can't confirm without choosing a payment method", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.startCheckout();
    await checkoutPage.fillBillingAddress(lookupAddress);
    await checkoutPage.proceedToPayment.click();

    await expect(checkoutPage.finishButton).toBeDisabled();
  });

  test("TC-CHECKOUT-06 Invalid card number shows an error", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.startCheckout();
    await checkoutPage.fillBillingAddress(lookupAddress);
    await checkoutPage.proceedToPayment.click();

    await checkoutPage.choosePaymentMethod("credit-card");
    await checkoutPage.fillCreditCard(invalidCard);

    await expect(checkoutPage.invalidCardMessage).toBeVisible();
    await expect(checkoutPage.finishButton).toBeDisabled();
  });

  test("TC-CHECKOUT-07 Invoice shows the order's total and billing address", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.startCheckout();
    await checkoutPage.fillBillingAddress(lookupAddress);
    const enteredAddress = await checkoutPage.getEnteredAddress();
    await checkoutPage.proceedToPayment.click();
    await checkoutPage.choosePaymentMethod("cash-on-delivery");
    await checkoutPage.confirmPayment();
    await checkoutPage.placeOrder();
    const invoiceNumber = await checkoutPage.getInvoiceNumber();

    const invoicesPage = new InvoicesPage(page);
    await invoicesPage.goto();
    await invoicesPage.openInvoice(invoiceNumber);

    // The invoice details are shown in read-only input fields, so we check their values
    await expect(invoicesPage.invoiceNumber).toHaveValue(invoiceNumber);
    await expect(invoicesPage.total).toHaveValue(`$ ${combinationPliers.price.toFixed(2)}`);
    await expect(invoicesPage.street).toHaveValue(enteredAddress.street);
    await expect(invoicesPage.city).toHaveValue(enteredAddress.city);
    await expect(invoicesPage.country).toHaveValue(enteredAddress.country);
    await expect(invoicesPage.paymentMethod).toHaveValue("Cash on Delivery");
  });

  test("TC-CHECKOUT-08 Place an order with a real address", async ({ page }) => {
    test.fail(true, "BUG-UI-003: real billing addresses are rejected");

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.startCheckout();
    await checkoutPage.fillBillingAddress(realAddress);
    await checkoutPage.proceedToPayment.click();
    await checkoutPage.choosePaymentMethod("cash-on-delivery");
    await checkoutPage.confirmPayment();
    await checkoutPage.finishButton.click();

    await expect(checkoutPage.orderConfirmation).toHaveText(ORDER_SUCCESS_REGEX);
  });

  test("TC-CHECKOUT-09 A rejected order shows an error message", async ({ page }) => {
    test.fail(true, "BUG-UI-002: the order fails silently, with no error shown");

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.startCheckout();
    // A real address makes the server reject the order (BUG-UI-003), so we use it to check the error handling
    await checkoutPage.fillBillingAddress(realAddress);
    await checkoutPage.proceedToPayment.click();
    await checkoutPage.choosePaymentMethod("cash-on-delivery");
    await checkoutPage.confirmPayment();
    await checkoutPage.finishButton.click();

    await expect(checkoutPage.orderErrorMessage).toBeVisible();
  });
});