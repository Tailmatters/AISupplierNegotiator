import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names with Tailwind CSS
 * @param inputs Class names to combine
 * @returns Combined class names string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date using Intl.DateTimeFormat
 * @param date Date to format
 * @param options Options for the formatter
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', options).format(d)
}

/**
 * Formats currency values
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @param options Options for the formatter
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(value)
}

/**
 * Formats a number with commas
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Formats a percentage value
 * @param value Number to format as percentage
 * @param options Options for the formatter
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 1, maximumFractionDigits: 1 }
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    ...options,
  }).format(value / 100)
}

/**
 * Calculates a savings amount from an original amount and a percentage
 * @param amount Original amount
 * @param percentage Savings percentage
 * @returns Amount saved
 */
export function calculateSavings(amount: number, percentage: number): number {
  return amount * (percentage / 100)
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param str String to truncate
 * @param length Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Creates a random color hex code
 * @returns Hex color code string
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
}

/**
 * Generates an array of distinct colors for charts
 * @param count Number of colors to generate
 * @returns Array of hex color codes
 */
export function generateChartColors(count: number): string[] {
  // Predefined colors for first few items to ensure good contrast
  const baseColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
    '#EC4899', // pink
  ]
  
  const colors = [...baseColors]
  
  // If we need more colors than the base set, generate them
  for (let i = baseColors.length; i < count; i++) {
    // Ensure we don't generate colors too similar to existing ones
    let newColor
    do {
      newColor = randomColor()
    } while (colors.includes(newColor))
    
    colors.push(newColor)
  }
  
  return colors.slice(0, count)
}

/**
 * Groups an array of objects by a key
 * @param array Array to group
 * @param key Key to group by
 * @returns Object with grouped items
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const keyValue = String(item[key])
    return {
      ...result,
      [keyValue]: [...(result[keyValue] || []), item],
    }
  }, {} as Record<string, T[]>)
}

/**
 * Sums values in an array of objects by a specific key
 * @param array Array of objects
 * @param key Key to sum by
 * @returns Sum of values
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => sum + Number(item[key] || 0), 0)
}

/**
 * Creates a debounced function
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Downloads data as a file
 * @param data Data to download
 * @param fileName Name of the file
 * @param contentType Content type of the file
 */
export function downloadFile(data: string, fileName: string, contentType: string): void {
  if (typeof window === 'undefined') return
  
  const blob = new Blob([data], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}

/**
 * Safely validates email format
 * @param email Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

/**
 * Gets a human-readable file size
 * @param bytes File size in bytes
 * @returns Human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Generates a random ID string
 * @param length Length of the ID (default: 10)
 * @returns Random ID string
 */
export function generateId(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}