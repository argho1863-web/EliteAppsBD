/**
 * Price Calculation Utility
 * Implements markup formula: NewPrice = BasePrice × (1 + Markup% / 100)
 */

export interface PriceCalculation {
  basePrice: number;
  markupPercentage: number;
  newPrice: number;
  markup: number;
}

/**
 * Calculates new price with markup
 * Formula: NewPrice = BasePrice × (1 + Markup% / 100)
 *
 * @param basePrice - Original price from scrapped website
 * @param markupPercentage - Markup percentage (e.g., 5 for 5%)
 * @returns Object with calculation details
 *
 * @example
 * calculatePrice(100, 5) // { basePrice: 100, markupPercentage: 5, newPrice: 105, markup: 5 }
 * calculatePrice(100, 15) // { basePrice: 100, markupPercentage: 15, newPrice: 115, markup: 15 }
 */
export function calculatePrice(
  basePrice: number,
  markupPercentage: number
): PriceCalculation {
  if (basePrice < 0) {
    throw new Error('Base price cannot be negative');
  }

  if (markupPercentage < 0 || markupPercentage > 1000) {
    throw new Error('Markup percentage must be between 0 and 1000');
  }

  const markupMultiplier = 1 + markupPercentage / 100;
  const newPrice = basePrice * markupMultiplier;
  const markupAmount = newPrice - basePrice;

  return {
    basePrice,
    markupPercentage,
    newPrice: Math.round(newPrice * 100) / 100, // Round to 2 decimals
    markup: Math.round(markupAmount * 100) / 100,
  };
}

/**
 * Applies markup to multiple prices
 */
export function applyMarkupToPrices(
  basePrices: number[],
  markupPercentage: number
): number[] {
  return basePrices.map((price) => calculatePrice(price, markupPercentage).newPrice);
}

/**
 * Calculates price range with markup applied
 */
export function calculatePriceRange(
  minPrice: number,
  maxPrice: number,
  markupPercentage: number
): { min: number; max: number } {
  const minCalc = calculatePrice(minPrice, markupPercentage);
  const maxCalc = calculatePrice(maxPrice, markupPercentage);

  return {
    min: minCalc.newPrice,
    max: maxCalc.newPrice,
  };
}
