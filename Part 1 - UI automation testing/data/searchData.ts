type SearchCase = { id: string; title: string; keyword?: string; category?: string; brand?: string };

export const searchCases: SearchCase[] = [
  { id: "TC-SEARCH-01", title: "keyword only", keyword: "pliers" },
  { id: "TC-SEARCH-02", title: "category only", category: "Hammer" },
  { id: "TC-SEARCH-03", title: "brand only", brand: "ForgeFlex Tools" },
  { id: "TC-SEARCH-04", title: "keyword + brand", keyword: "pliers", brand: "MightyCraft Hardware" },
  { id: "TC-SEARCH-05", title: "keyword + category + brand (three criteria)", keyword: "pliers", category: "Pliers", brand: "ForgeFlex Tools" },
];

export const PRICE_SEARCH = { keyword: "pliers", maxPrice: 13 };
export const CASE_KEYWORD = "pliers";
export const UNKNOWN_KEYWORD = "xyz123notexist";
export const NO_RESULTS_MESSAGE = "There are no products found.";