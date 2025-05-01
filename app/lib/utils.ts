import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names/class values into a single string
 * Used for merging Tailwind CSS classes in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date with options
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric"
  }
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options
  }).format(new Date(date))
}

/**
 * Format a currency value
 * @param amount Number to format as currency
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  options: Intl.NumberFormatOptions = {}
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    ...options
  }).format(amount)
}

/**
 * Format a percentage value
 * @param value Number to format as percentage
 * @param digits Number of decimal digits to display
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, digits: number = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value / 100)
}

/**
 * Creates a delay promise
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if the current environment is a browser
 */
export const isBrowser = typeof window !== "undefined"