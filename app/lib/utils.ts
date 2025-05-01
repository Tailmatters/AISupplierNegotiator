import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names with Tailwind's merge function
 * This allows for conditional class application while maintaining Tailwind's specificity
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a date in a user-friendly format
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', {
    ...options,
  }).format(new Date(date))
}

/**
 * Format a currency value
 * @param value - Number to format
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Format a percentage value
 * @param value - Number to format as percentage (0-1)
 * @param decimal - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Truncate a string to a specified length with ellipsis
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, length: number = 100): string {
  if (!str || str.length <= length) return str
  return `${str.slice(0, length)}...`
}

/**
 * Calculate the difference between two dates in days
 * @param startDate - Start date
 * @param endDate - End date (defaults to now)
 * @returns Number of days difference
 */
export function daysBetween(
  startDate: Date | string,
  endDate: Date | string = new Date()
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Safely parse JSON with error handling
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    return fallback
  }
}

/**
 * Delay execution for a specified time
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a random string of specified length
 * @param length - Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}