import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine multiple class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a datetime to a readable string
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

/**
 * Format a currency value
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || ''
  return `${text.slice(0, maxLength)}...`
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Deep merge two objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target }
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key as keyof Partial<T>])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof Partial<T>] })
        } else {
          output[key as keyof T] = deepMerge(
            target[key as keyof T],
            source[key as keyof Partial<T>] as any
          )
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof Partial<T>] })
      }
    })
  }
  
  return output
}

/**
 * Check if value is an object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Group data by key
 */
export function groupBy<T>(data: T[], key: keyof T): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const groupKey = String(item[key])
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercentage(original: number, final: number): number {
  if (original === 0) return 0
  return ((original - final) / original) * 100
}

/**
 * Sleep for a given time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let retries = 0
  let lastError: any
  
  while (retries <= maxRetries) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      retries++
      
      if (retries > maxRetries) break
      
      await sleep(delay * Math.pow(2, retries - 1))
    }
  }
  
  throw lastError
}