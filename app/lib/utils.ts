import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine multiple class names with Tailwind CSS compatibility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a string with options
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
) {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date))
}

/**
 * Format a number as a currency string with options
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
  }
) {
  return new Intl.NumberFormat('en-US', options).format(amount)
}

/**
 * Format a number as a percentage string
 */
export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }
) {
  return new Intl.NumberFormat('en-US', options).format(value / 100)
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Truncate a string to a maximum length with an ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Group an array of objects by a key
 */
export function groupBy<T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce(
    (result, item) => {
      const key = getKey(item)
      if (!result[key]) {
        result[key] = []
      }
      result[key].push(item)
      return result
    },
    {} as Record<K, T[]>
  )
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends object = object, U extends object = T>(
  target: T,
  source: U
): T & U {
  const isObject = (obj: any): obj is object => obj && typeof obj === 'object'
  
  const output = { ...target } as T & U
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = (target as any)[key]
      const sourceValue = (source as any)[key]
      
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        (output as any)[key] = [...targetValue, ...sourceValue]
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        (output as any)[key] = deepMerge(targetValue, sourceValue)
      } else {
        (output as any)[key] = sourceValue
      }
    })
  }
  
  return output
}