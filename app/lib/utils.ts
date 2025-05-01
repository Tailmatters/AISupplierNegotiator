import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs Class values to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a more readable string
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
  }).format(new Date(date))
}

/**
 * Format a number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...options,
  }).format(amount)
}

/**
 * Truncate a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length (default: 50)
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

/**
 * Calculate the time difference between a date and now
 * @param date Date to compare
 * @returns Time difference string (e.g. "2 days ago")
 */
export function timeAgo(date: Date | string | number): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  
  // Convert milliseconds to seconds
  const seconds = Math.floor(diff / 1000)
  
  // Less than a minute
  if (seconds < 60) {
    return "just now"
  }
  
  // Convert seconds to minutes
  const minutes = Math.floor(seconds / 60)
  
  // Less than an hour
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  }
  
  // Convert minutes to hours
  const hours = Math.floor(minutes / 60)
  
  // Less than a day
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  }
  
  // Convert hours to days
  const days = Math.floor(hours / 24)
  
  // Less than a month
  if (days < 30) {
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }
  
  // Convert days to months
  const months = Math.floor(days / 30)
  
  // Less than a year
  if (months < 12) {
    return `${months} ${months === 1 ? "month" : "months"} ago`
  }
  
  // Convert months to years
  const years = Math.floor(months / 12)
  
  return `${years} ${years === 1 ? "year" : "years"} ago`
}

/**
 * Sanitize a string for use in HTML
 * @param str String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Generate a random string of a specified length
 * @param length Length of the random string
 * @returns Random string
 */
export function randomString(length: number = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Deep clone an object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}