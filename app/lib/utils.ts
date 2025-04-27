import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and tailwind classes efficiently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with proper locale and currency symbol
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Format a date string into a human-readable format
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat("en-US", options).format(d)
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number
): string {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDays = Math.round(diffHr / 24)
  const diffWeeks = Math.round(diffDays / 7)
  const diffMonths = Math.round(diffDays / 30)
  const diffYears = Math.round(diffDays / 365)
  
  if (diffSec < 60) return rtf.format(-diffSec, "second")
  if (diffMin < 60) return rtf.format(-diffMin, "minute")
  if (diffHr < 24) return rtf.format(-diffHr, "hour")
  if (diffDays < 7) return rtf.format(-diffDays, "day")
  if (diffWeeks < 4) return rtf.format(-diffWeeks, "week")
  if (diffMonths < 12) return rtf.format(-diffMonths, "month")
  return rtf.format(-diffYears, "year")
}

/**
 * Safely truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

/**
 * Generate random ID with specified length
 */
export function generateId(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Calculate percent change between two numbers
 */
export function percentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100
  return Number(((newValue - oldValue) / Math.abs(oldValue) * 100).toFixed(2))
}

/**
 * Check if an object has all required properties
 */
export function hasRequiredProps<T extends object>(
  obj: T,
  props: (keyof T)[]
): boolean {
  return props.every(prop => prop in obj && obj[prop] !== undefined && obj[prop] !== null)
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target }
  
  for (const key in source) {
    if (source[key] === undefined) continue
    
    if (
      isObject(source[key]) && 
      key in target && 
      isObject(target[key])
    ) {
      output[key] = deepMerge(target[key] as object, source[key] as object) as T[Extract<keyof T, string>]
    } else {
      output[key] = source[key] as T[Extract<keyof T, string>]
    }
  }
  
  return output
}

function isObject(item: unknown): item is object {
  return item !== null && typeof item === "object" && !Array.isArray(item)
}

/**
 * Group array items by a property or function
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyOrFn: ((item: T) => K) | keyof T
): Record<K, T[]> {
  const getKey = typeof keyOrFn === "function"
    ? keyOrFn
    : (item: T) => item[keyOrFn] as unknown as K
  
  return array.reduce((acc, item) => {
    const key = getKey(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<K, T[]>)
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}