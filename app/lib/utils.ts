import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names with Tailwind's intelligent merging
 * to prevent class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date with different options based on the provided format
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
): string {
  const d = new Date(date)
  
  if (format === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHr = Math.round(diffMin / 60)
    const diffDays = Math.round(diffHr / 24)
    const diffWeeks = Math.round(diffDays / 7)
    const diffMonths = Math.round(diffDays / 30)
    const diffYears = Math.round(diffDays / 365)
    
    if (diffSec < 60) return diffSec <= 1 ? 'just now' : `${diffSec} seconds ago`
    if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`
    if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`
    if (diffDays < 7) return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`
    if (diffWeeks < 4) return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`
    if (diffMonths < 12) return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`
  }
  
  // Format options based on the requested format
  let options: Intl.DateTimeFormatOptions;
  
  if (format === 'short') {
    options = { 
      month: 'numeric' as const, 
      day: 'numeric' as const, 
      year: '2-digit' as const 
    };
  } else if (format === 'medium') {
    options = { 
      month: 'short' as const, 
      day: 'numeric' as const, 
      year: 'numeric' as const 
    };
  } else { // long
    options = {
      weekday: 'long' as const,
      month: 'long' as const,
      day: 'numeric' as const,
      year: 'numeric' as const,
      hour: 'numeric' as const,
      minute: '2-digit' as const,
    };
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(d)
}

/**
 * Formats a number as currency with options
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount)
}

/**
 * Formats a number as percentage with 2 decimal places by default
 */
export function formatPercentage(
  value: number,
  decimalPlaces = 2
): string {
  return `${(value * 100).toFixed(decimalPlaces)}%`
}

/**
 * Truncates a string to the specified length and adds an ellipsis
 */
export function truncateString(
  str: string,
  maxLength: number
): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this
    
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      timeout = null
      func.apply(context, args)
    }, wait)
  }
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per the specified wait time
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let waiting = false
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  
  return function(this: any, ...args: Parameters<T>) {
    if (waiting) {
      lastArgs = args
      lastThis = this
      return
    }
    
    func.apply(this, args)
    waiting = true
    
    setTimeout(() => {
      waiting = false
      if (lastArgs) {
        func.apply(lastThis, lastArgs)
        lastArgs = null
        lastThis = null
      }
    }, wait)
  }
}