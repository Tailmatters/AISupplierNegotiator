import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names into a single className string with Tailwind merge optimization
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a localized string representation
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options
  }
  
  return dateObj.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format a currency value with the specified currency code
 */
export function formatCurrency(
  value: number,
  currency = 'USD',
  options: Intl.NumberFormatOptions = {}
) {
  if (typeof value !== 'number') return ''
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    ...options
  }).format(value)
}

/**
 * Calculate percentage change between two numbers
 */
export function calculatePercentageChange(current: number, previous: number) {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Format percentage with sign (+ or -)
 */
export function formatPercentage(value: number, options: Intl.NumberFormatOptions = {}) {
  const sign = value > 0 ? '+' : ''
  
  return `${sign}${new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options
  }).format(value / 100)}`
}

/**
 * Truncate a string to the specified length and add ellipsis if truncated
 */
export function truncateString(str: string, length = 50) {
  if (!str || str.length <= length) return str
  return `${str.slice(0, length)}...`
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string) {
  if (!name) return ''
  
  const words = name.trim().split(/\s+/)
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * Sleep for the specified number of milliseconds
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a random string of the specified length
 */
export function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}