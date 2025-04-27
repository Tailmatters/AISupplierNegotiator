import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind CSS class names with conditional logic support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date object to a localized string
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }
  
  return dateObj.toLocaleDateString(undefined, defaultOptions)
}

/**
 * Formats a currency amount with the specified locale and currency
 */
export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Formats a percentage value
 */
export function formatPercentage(value: number, decimals = 2) {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Truncates text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Creates a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Safely parses JSON, returning a fallback value on error
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    return fallback
  }
}

/**
 * Generates a range of numbers from start to end (inclusive)
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Groups an array of objects by a specified key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const keyValue = String(item[key])
    result[keyValue] = result[keyValue] || []
    result[keyValue].push(item)
    return result
  }, {} as Record<string, T[]>)
}