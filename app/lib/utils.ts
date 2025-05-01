import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

/**
 * Combines multiple class names with tailwind merge
 * @param inputs Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a relative time (e.g., "5 minutes ago")
 * @param date Date to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatRelativeTime(
  date: Date | string | number,
  options: { addSuffix?: boolean } = {}
): string {
  const { addSuffix = true } = options;
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  return formatDistanceToNow(dateObj, { addSuffix });
}

/**
 * Formats a date to a standard format
 * @param date Date to format
 * @param formatStr Format string (defaults to "MMM d, yyyy")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  formatStr: string = "MMM d, yyyy"
): string {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  return format(dateObj, formatStr);
}

/**
 * Formats a currency value
 * @param amount Number to format
 * @param currency Currency code (defaults to USD)
 * @param locale Locale for formatting (defaults to en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a percentage value
 * @param value Number to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a number with thousand separators
 * @param value Number to format
 * @param locale Locale for formatting (defaults to en-US)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Truncates a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @param ellipsis Ellipsis characters
 * @returns Truncated string
 */
export function truncateString(
  str: string,
  maxLength: number = 50,
  ellipsis: string = "..."
): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}${ellipsis}`;
}

/**
 * Generates a random ID
 * @param length Length of the ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounces a function
 * @param fn Function to debounce
 * @param ms Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Groups an array of objects by a key
 * @param array Array to group
 * @param key Key to group by
 * @returns Grouped object
 */
export function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculates the sum of an array of numbers
 * @param array Array of numbers
 * @returns Sum of the array
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculates the average of an array of numbers
 * @param array Array of numbers
 * @returns Average of the array
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}