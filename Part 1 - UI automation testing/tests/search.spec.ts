import { test, expect } from "@playwright/test";
import { SearchPage } from "../pages/SearchPage";
import { ProductPage } from "../pages/ProductPage";
import { searchCases, PRICE_SEARCH, CASE_KEYWORD, UNKNOWN_KEYWORD, NO_RESULTS_MESSAGE } from "../data/searchData";

// These tests don't depend on which products the shop has.
// They go through every result and check it follows every search rule that was applied.

test.describe("Search", () => {
  for (const data of searchCases) {
    test(`${data.id} Search by ${data.title}`, async ({ page }) => {
      const searchPage = new SearchPage(page);
      await searchPage.goto();

      if (data.keyword) await searchPage.searchFor(data.keyword);
      if (data.category) await searchPage.filterByCategory(data.category);
      if (data.brand) await searchPage.filterByBrand(data.brand);

      // Read what the screen shows before we open any product
      const shownNames = await searchPage.getProductNames();
      const shownLinks = await searchPage.getProductLinks();
      expect(shownNames.length, "The search should show at least one product").toBeGreaterThan(0);

      // ---------- 1. Every product on the screen follows every rule ----------

      // Keyword: every name contains it (not case-sensitive)
      if (data.keyword) {
        for (const name of shownNames) {
          expect(name.toLowerCase(), `"${name}" should contain "${data.keyword}"`).toContain(data.keyword.toLowerCase());
        }
      }

      // Brand and category aren't on the result cards, so we open every product and read its badges
      if (data.category || data.brand) {
        const productPage = new ProductPage(page);
        for (const link of shownLinks) {
          await page.goto(link);
          const productName = await productPage.productName.innerText();
          if (data.category) {
            await expect(productPage.category, `"${productName}" should be in category "${data.category}"`).toHaveText(data.category);
          }
          if (data.brand) {
            await expect(productPage.brand, `"${productName}" should be from brand "${data.brand}"`).toHaveText(data.brand);
          }
        }
      }

      // ---------- 2. The screen shows exactly what the server sent ----------
      // Nothing missing, nothing extra, nothing duplicated
      expect(shownNames).toEqual(searchPage.getExpectedNames());
    });
  }

  test("TC-SEARCH-06 Search by keyword + max price", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.searchFor(PRICE_SEARCH.keyword);

    await searchPage.setMaxPrice(PRICE_SEARCH.maxPrice);
    const maxPrice = PRICE_SEARCH.maxPrice;

    // Rule: at least one result, every result costs no more than the max price, and still matches the keyword.
    // expect.poll keeps checking until the list has updated after the slider moved.
    // (An empty list would pass "every price <= max" by itself, so we also require at least one product.)
    await expect.poll(async () => {
      const prices = await searchPage.getProductPrices();
      return prices.length > 0 && prices.every((price) => price <= maxPrice);
    }, {
      timeout: 15_000, // the list updates a little after the slider stops
      message: `Expected at least one product, all priced at or below $${maxPrice}`,
    }).toBe(true);
    
    for (const name of await searchPage.getProductNames()) {
      expect(name.toLowerCase(), `"${name}" should contain "${PRICE_SEARCH.keyword}"`).toContain(PRICE_SEARCH.keyword);
    }
  });

  test("TC-SEARCH-07 Search is not case-sensitive", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.searchFor(CASE_KEYWORD.toLowerCase());
    const lowercaseResults = await searchPage.getProductNames();

    await searchPage.searchFor(CASE_KEYWORD.toUpperCase());
    const uppercaseResults = await searchPage.getProductNames();

    expect(lowercaseResults.length).toBeGreaterThan(0);
    expect(uppercaseResults).toEqual(lowercaseResults);
  });

  test("TC-SEARCH-08 Unknown keyword shows a no-results message", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.searchFor(UNKNOWN_KEYWORD);

    await expect(searchPage.noResults).toHaveText(NO_RESULTS_MESSAGE);
    await expect(searchPage.resultCount).toHaveText(`0 products found for '${UNKNOWN_KEYWORD}'`);
    await expect(searchPage.productNames).toHaveCount(0);
  });

  test("TC-SEARCH-09 Reset clears the search", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    const allProducts = await searchPage.getProductNames();
    await searchPage.searchFor(CASE_KEYWORD);

    await searchPage.resetButton.click();

    await expect(searchPage.searchInput).toHaveValue("");
    await expect(searchPage.searchCaption).toBeHidden();
    await expect(searchPage.productNames).toHaveText(allProducts); // the same products as before the search
  });

  test("TC-SEARCH-10 Script in the search box is not run", async ({ page }) => {
    let alertOpened = false;
    page.on("dialog", async (dialog) => {
      alertOpened = true;
      await dialog.dismiss();
    });

    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.searchFor("<script>alert(1)</script>");

    await expect(searchPage.noResults).toHaveText(NO_RESULTS_MESSAGE);
    expect(alertOpened).toBe(false);
  });
});