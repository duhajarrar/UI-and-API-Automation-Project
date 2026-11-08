export type Address = {
  country: string; // country code in the dropdown, for example "US" or "PS"
  postalCode: string;
  houseNumber: string;
  street?: string; // leave empty to keep what the site fills in from the postal code
  city?: string;
  state?: string;
};

// The site fills street, city, and state from the postal code, and only accepts that address.
// So for orders that must succeed, we enter these three fields and keep what the site fills in.
export const lookupAddress: Address = {
  country: "US",
  postalCode: "10001",
  houseNumber: "5",
};

// A real address. The site rejects it (BUG-UI-003), and doesn't show why (BUG-UI-002).
export const realAddress: Address = {
  country: "PS",
  postalCode: "00970",
  houseNumber: "12",
  street: "Al-Irsal Street",
  city: "Ramallah",
  state: "Ramallah and Al-Bireh",
};

export const ORDER_SUCCESS_REGEX = /Thanks for your order! Your invoice number is INV-\d+/;

export const paymentMethods = [
  { id: "TC-CHECKOUT-01", title: "Cash on Delivery", method: "cash-on-delivery" },
  { id: "TC-CHECKOUT-02", title: "Credit Card", method: "credit-card", card: { number: "4111-1111-1111-1111", expiry: "12/2030", cvv: "123", holder: "Duha Tester" } },
];

export const invalidCard = { number: "1234", expiry: "12/2030", cvv: "123", holder: "Duha Tester" };