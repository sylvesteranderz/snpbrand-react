/**
 * Currency utility functions for GHS (Ghana Cedis)
 */

export const CURRENCY_SYMBOL = '₵'
export const CURRENCY_CODE = 'GHS'

/**
 * Format a number as currency in Ghana Cedis
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined | null, showSymbol: boolean = true): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_SYMBOL}0.00` : '0.00'
  }
  const formatted = amount.toFixed(2)
  return showSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted
}

/**
 * Format currency for display in components
 * @param amount - The amount to format
 * @returns Formatted currency string with symbol
 */
export const formatPrice = (amount: number): string => {
  return formatCurrency(amount, true)
}

/**
 * Get currency symbol
 * @returns Currency symbol string
 */
export const getCurrencySymbol = (): string => {
  return CURRENCY_SYMBOL
}
