import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

/**
 * Combines class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Format a date in a specific format
 */
export function formatDate(
  dateString: string | Date,
  formatString: string = 'PPP'
): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return format(date, formatString)
}

/**
 * Format a currency value
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a number with commas
 */
export function formatNumber(
  number: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(number)
}

/**
 * Format a percentage
 */
export function formatPercentage(
  value: number,
  decimalPlaces: number = 1,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value / 100)
}

/**
 * Truncate a string to a specific length
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Calculate the percentage difference between two numbers
 */
export function percentageDifference(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

/**
 * Group an array of objects by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Sort an array of objects by a key
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    
    if (aValue === bValue) return 0
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    // Handle number comparison
    if (
      (typeof aValue === 'number' && typeof bValue === 'number') ||
      (aValue instanceof Date && bValue instanceof Date)
    ) {
      return direction === 'asc'
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any)
    }
    
    return 0
  })
}

/**
 * Filter undefined values from an object
 */
export function filterUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value
    }
    return acc
  }, {} as Partial<T>)
}