import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with tailwind merge
 * @param inputs Class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a localized string
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Date(date).toLocaleDateString("en-US", options)
}

/**
 * Format a date with time
 * @param date Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

/**
 * Format currency amount
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Generate a random string
 * @param length Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Truncate a string to a specified length
 * @param str String to truncate
 * @param length Maximum length
 * @param ending Ending to append if truncated
 * @returns Truncated string
 */
export function truncateString(
  str: string,
  length: number = 50,
  ending: string = "..."
): string {
  if (str.length <= length) {
    return str
  }
  
  return str.substring(0, length - ending.length) + ending
}

/**
 * Debounce a function
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * Group array items by a key
 * @param array Array to group
 * @param key Key to group by
 * @returns Grouped object
 */
export function groupBy<T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    result[groupKey] = result[groupKey] || []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Extract distinct values for a key from an array of objects
 * @param array Array of objects
 * @param key Key to extract values for
 * @returns Array of distinct values
 */
export function getDistinctValues<T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): T[K][] {
  return [...new Set(array.map(item => item[key]))]
}

/**
 * Parse a string to a Date, handling various formats
 * @param dateStr Date string
 * @returns Date object or null if invalid
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Calculate difference in days between two dates
 * @param date1 First date
 * @param date2 Second date (defaults to now)
 * @returns Number of days
 */
export function daysBetween(
  date1: Date | string | number,
  date2: Date | string | number = new Date()
): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}