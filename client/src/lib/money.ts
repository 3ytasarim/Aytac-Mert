/**
 * Money formatting utilities for Turkish Lira (TL)
 * 
 * Data storage convention:
 * - courses.price: stored as TL integer (25000 = ₺25,000)
 * - invoices.amount: stored as kuruş integer (2500000 = ₺25,000)
 */

/**
 * Format TL amount for display
 * @param amount Amount in Turkish Lira as integer
 * @returns Formatted string like "₺25.000"
 */
export function formatTL(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert kuruş to TL
 * @param kurus Amount in kuruş (cents)
 * @returns Amount in TL
 */
export function kurusToTL(kurus: number): number {
  return Math.round(kurus / 100);
}

/**
 * Convert TL to kuruş
 * @param tl Amount in TL
 * @returns Amount in kuruş (cents)
 */
export function tlToKurus(tl: number): number {
  return Math.round(tl * 100);
}

/**
 * Format course price for display (courses.price is stored as TL integer)
 * @param coursePriceTL Course price in TL
 * @returns Formatted string like "₺25.000"
 */
export function formatCoursePrice(coursePriceTL: number): string {
  return formatTL(coursePriceTL);
}

/**
 * Format invoice amount for display (invoices.amount is stored as kuruş integer)
 * @param invoiceAmountKurus Invoice amount in kuruş
 * @returns Formatted string like "₺25.000"
 */
export function formatInvoiceAmount(invoiceAmountKurus: number): string {
  return formatTL(kurusToTL(invoiceAmountKurus));
}