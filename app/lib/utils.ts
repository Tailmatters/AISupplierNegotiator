import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

/**
 * Combines class names with tailwind-merge for optimal class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date as a relative string (e.g., "5 minutes ago")
 */
export function formatRelativeTime(dateString?: string | Date): string {
  if (!dateString) return ''
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Formats a date with a custom format
 */
export function formatDate(
  dateString?: string | Date,
  dateFormat = 'MMM d, yyyy'
): string {
  if (!dateString) return ''
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return format(date, dateFormat)
}

/**
 * Formats a currency value
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a number with a specific format
 */
export function formatNumber(
  number: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', options).format(number)
}

/**
 * Formats a percentage value
 */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

/**
 * Truncates a string to a specified length
 */
export function truncateString(str: string, length = 100): string {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

/**
 * Creates a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Safely parses JSON without throwing errors
 */
export function safelyParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch (e) {
    return fallback
  }
}

/**
 * Deep merges objects
 */
export function deepMerge<T extends object = object>(target: T, ...sources: object[]): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  
  if (source === undefined) {
    return target
  }
  
  if (isMergeableObject(target) && isMergeableObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isMergeableObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    })
  }
  
  return deepMerge(target, ...sources)
}

function isMergeableObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Groups an array by a specific key
 */
export function groupBy<T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = getKey(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as Record<K, T[]>)
}

/**
 * Creates a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}

/**
 * Creates an array of numbers in range
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Generates a random string
 */
export function generateRandomString(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  return result
}