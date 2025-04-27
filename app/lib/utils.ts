import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine multiple class names with Tailwind CSS support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date with options
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
 * Format currency with options
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
  }
): string {
  return new Intl.NumberFormat('en-US', {
    ...options,
  }).format(amount)
}

/**
 * Format percentage with options
 */
export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }
): string {
  return new Intl.NumberFormat('en-US', {
    ...options,
  }).format(value)
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str
  }
  
  return str.slice(0, length) + '...'
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const merged = { ...target } as any

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue)
    ) {
      merged[key] = deepMerge(targetValue, sourceValue)
    } else if (sourceValue !== undefined) {
      merged[key] = sourceValue
    }
  }

  return merged
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}