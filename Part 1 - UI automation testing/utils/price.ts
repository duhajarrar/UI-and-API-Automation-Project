/** Turns a price like "$14.15" into the number 14.15 */
export function priceToNumber(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ""));
}