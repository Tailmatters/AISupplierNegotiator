import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ZodIssue } from 'zod'

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge
 * to properly handle Tailwind CSS classes
 * @param inputs Multiple class name inputs to combine
 * @returns A single string of combined class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a date into a localized string
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', {
    ...options,
  }).format(new Date(date))
}

/**
 * Format a currency value
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a number with specified options
 * @param value Number to format
 * @param options Intl.NumberFormatOptions for formatting
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', options).format(value)
}

/**
 * Format a percentage value
 * @param value Decimal value to format as percentage (e.g., 0.1 for 10%)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Create a delay using a promise
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get form errors from Zod validation issues
 * @param issues Zod validation issues
 * @returns Object mapping field paths to error messages
 */
export function getFormErrors(issues: ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {}
  
  for (const issue of issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  
  return errors
}

/**
 * Check if an object is empty
 * @param obj Object to check
 * @returns True if object has no own properties
 */
export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Generate a random string ID
 * @param length Length of the ID
 * @returns Random string ID
 */
export function generateId(length: number = 12): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}