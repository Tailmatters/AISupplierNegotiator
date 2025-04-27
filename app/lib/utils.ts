import { type ClassValue, clsx } from 'clsx'
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
  
  // Return relative time (e.g., "5 minutes ago", "2 days ago")
  if (format === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffMonths / 12)
    
    if (diffSecs < 60) return diffSecs + ' seconds ago'
    if (diffMins < 60) return diffMins + ' minutes ago'
    if (diffHours < 24) return diffHours + ' hours ago'
    if (diffDays < 30) return diffDays + ' days ago'
    if (diffMonths < 12) return diffMonths + ' months ago'
    return diffYears + ' years ago'
  }
  
  // Format options based on the requested format
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  }[format]
  
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