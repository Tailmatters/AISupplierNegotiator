import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class values into a single string using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency 
 */
export function formatCurrency(amount: number, currency = 'USD', options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(amount)
}

/**
 * Format a date with custom options
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
) {
  return new Intl.DateTimeFormat('en-US', options).format(
    typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date
  )
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Calculate the percentage of a value from a total
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Convert kebab-case or snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase())
}

/**
 * Generate random ID
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}