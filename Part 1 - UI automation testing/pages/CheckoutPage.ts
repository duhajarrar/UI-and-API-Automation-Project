import { Page, Locator } from "@playwright/test";
import { Address } from "../data/checkoutData";

export class CheckoutPage {
  readonly page: Page;
  // Step 1: cart
  readonly proceedFromCart: Locator;
  // Step 2: sign in
  readonly alreadyLoggedInMessage: Locator;
  readonly proceedFromSignIn: Locator;
  // Step 3: billing address
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly proceedToPayment: Locator;
  // Step 4: payment
  readonly paymentMethod: Locator;
  readonly cardNumber: Locator;
  readonly expirationDate: Locator;
  readonly cvv: Locator;
  readonly cardHolderName: Locator;
  readonly invalidCardMessage: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccessMessage: Locator;
  readonly orderConfirmation: Locator;
  readonly orderErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proceedFromCart = page.getByTestId("proceed-1");
    this.alreadyLoggedInMessage = page.getByText("you are already logged in");
    this.proceedFromSignIn = page.getByTestId("proceed-2");
    this.country = page.getByTestId("country");
    this.postalCode = page.getByTestId("postal_code");
    this.houseNumber = page.getByTestId("house_number");
    this.street = page.getByTestId("street");
    this.city = page.getByTestId("city");
    this.state = page.getByTestId("state");
    this.proceedToPayment = page.getByTestId("proceed-3");
    this.paymentMethod = page.getByTestId("payment-method");
    this.cardNumber = page.getByTestId("credit_card_number");
    this.expirationDate = page.getByTestId("expiration_date");
    this.cvv = page.getByTestId("cvv");
    this.cardHolderName = page.getByTestId("card_holder_name");
    this.invalidCardMessage = page.getByText("Invalid card number format.");
    this.finishButton = page.getByTestId("finish");
    this.paymentSuccessMessage = page.getByTestId("payment-success-message");
    this.orderConfirmation = page.locator("#order-confirmation");
    this.orderErrorMessage = page.getByRole("alert").filter({ hasText: /does not match|does not belong|error|failed/i });
  }

  // Opens the cart and walks through steps 1 and 2 (the user is already logged in)
  async startCheckout() {
    await this.page.goto("/checkout");
    await this.proceedFromCart.click();
    await this.proceedFromSignIn.click();
  }

  async fillBillingAddress(address: Address) {
    await this.country.selectOption(address.country);
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    // The site looks up the address from the postal code and fills street, city, and state.
    // We wait for that to finish, so it doesn't overwrite anything we type next.
    await this.page.waitForLoadState("networkidle");
    if (address.street) await this.street.fill(address.street);
    if (address.city) await this.city.fill(address.city);
    if (address.state) await this.state.fill(address.state);
  }

  // Reads the address as it is in the form now (useful after the site fills it in)
  async getEnteredAddress() {
    return {
      street: await this.street.inputValue(),
      city: await this.city.inputValue(),
      country: await this.country.inputValue(),
    };
  }

  async choosePaymentMethod(method: string) {
    await this.paymentMethod.selectOption(method);
  }

  async fillCreditCard(card: { number: string; expiry: string; cvv: string; holder: string }) {
    await this.cardNumber.fill(card.number);
    await this.expirationDate.fill(card.expiry);
    await this.cvv.fill(card.cvv);
    await this.cardHolderName.fill(card.holder);
  }

  // "Confirm" is clicked twice on the site: once to pay, once to place the order
  async confirmPayment() {
    await this.finishButton.click();
    await this.paymentSuccessMessage.waitFor();
  }

  async placeOrder() {
    await this.finishButton.click();
    await this.orderConfirmation.waitFor();
  }

  async getInvoiceNumber(): Promise<string> {
    const text = await this.orderConfirmation.innerText();
    return text.match(/INV-\d+/)?.[0] ?? "";
  }
}