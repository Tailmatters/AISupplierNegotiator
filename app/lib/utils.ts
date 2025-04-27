import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This helps with conditional classes and avoids conflicting Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  
  return new Date(date).toLocaleDateString('en-US', mergedOptions)
}

/**
 * Format a currency amount
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a number with commas
 */
export function formatNumber(
  num: number,
  options: Intl.NumberFormatOptions = {}
) {
  return new Intl.NumberFormat('en-US', options).format(num)
}

/**
 * Truncate a string to a specific length and add ellipsis
 */
export function truncate(str: string, length: number) {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}

/**
 * Safe JSON parse that returns fallback on error
 */
export function safeJsonParse<T>(
  value: string,
  fallback: T
): T {
  try {
    return JSON.parse(value) as T
  } catch (e) {
    return fallback
  }
}

/**
 * Debounce a function
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
 * Get initials from name
 */
export function getInitials(name: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Generate a random color based on a string (for avatars, etc.)
 */
export function stringToColor(str: string): string {
  if (!str) return '#6366F1' // Default indigo color
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 50%)`
}