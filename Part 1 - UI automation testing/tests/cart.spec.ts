import { test, expect } from "@playwright/test";
import { ProductPage } from "../pages/ProductPage";
import { CartPage } from "../pages/CartPage";
import { combinationPliers, pliers } from "../data/cartData";
import { priceToNumber } from "../utils/price";

// The site keeps the cart in the browser tab's session storage, which storageState doesn't save.
// So every test starts with an empty cart, even though it's logged in, and tests can run in parallel.

test.describe("Cart", () => {
  test("TC-CART-01 Add a product to the cart", async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart();

    await expect(productPage.addedToCartMessage.first()).toBeVisible();
    await expect(productPage.cartBadge).toHaveText("1");

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.productTitles).toHaveText([combinationPliers.name]);
    await expect(cartPage.quantityOf(combinationPliers.name)).toHaveValue("1");
    const cartPrice = priceToNumber(await cartPage.productPrice.innerText());
    await expect(cartPrice).toBe(combinationPliers.price);
  });

  test("TC-CART-02 Add a product with a chosen quantity", async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart(3);

    await expect(productPage.cartBadge).toHaveText("3");

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.quantityOf(combinationPliers.name)).toHaveValue("3");
  });

  test("TC-CART-03 Add two different products", async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart();
    await productPage.open(pliers.name);
    await productPage.addToCart();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.productTitles).toHaveText([combinationPliers.name, pliers.name]);
  });

  test("TC-CART-04 Line total and cart total are calculated correctly", async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart(2);
    await productPage.open(pliers.name);
    await productPage.addToCart();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.productTitles).toHaveCount(2);

    const line1 = priceToNumber(await cartPage.lineTotalOf(combinationPliers.name).innerText());
    const line2 = priceToNumber(await cartPage.lineTotalOf(pliers.name).innerText());
    const total = priceToNumber(await cartPage.cartTotal.innerText());

    expect(line1).toBeCloseTo(combinationPliers.price * 2, 2);
    expect(line2).toBeCloseTo(pliers.price, 2);
    expect(total).toBeCloseTo(line1 + line2, 2);
  });

  test("TC-CART-05 Change the quantity in the cart", async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.updateQuantity(combinationPliers.name, 3);

    await expect(cartPage.quantityUpdatedMessage.first()).toBeVisible();
    await expect(cartPage.lineTotalOf(combinationPliers.name)).toHaveText(`$${(combinationPliers.price * 3).toFixed(2)}`);
    await expect(productPage.cartBadge).toHaveText("3");
  });

  test("TC-CART-06 Remove a product", async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.removeProduct(combinationPliers.name);

    await expect(cartPage.productDeletedMessage.first()).toBeVisible();
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(productPage.cartLink).toBeHidden();
  });

  test("TC-CART-07 Cart is kept after reloading the page", async ({ page }) => {
    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart();

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await page.reload();

    await expect(cartPage.productTitles).toHaveText([combinationPliers.name]);
  });

  test("TC-CART-08 Logged-in user's cart is kept in a new tab", async ({ page, context }) => {
    // Known bug: the cart lives in the tab's session storage, not in the user's account.
    // test.fail() keeps the run green; when the bug is fixed, this test fails and reminds us to remove the line.
    test.fail(true, "BUG-UI-001: a logged-in user's cart is lost in a new tab");

    const productPage = new ProductPage(page);
    await productPage.open(combinationPliers.name);
    await productPage.addToCart();

    // Same logged-in user opens the shop in a second tab
    const newTab = await context.newPage();
    const cartInNewTab = new CartPage(newTab);
    await cartInNewTab.goto();

    await expect(cartInNewTab.productTitles).toHaveText([combinationPliers.name]);
  });
});