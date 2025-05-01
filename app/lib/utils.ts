import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a string
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions to customize the formatting
 * @returns The formatted date string
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
  }).format(new Date(date));
}

/**
 * Formats a currency value as a string
 * @param amount The amount to format
 * @param currency The currency code (e.g., "USD")
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a number as a percentage
 * @param value The decimal value to format as a percentage
 * @param decimalPlaces The number of decimal places to display
 * @returns The formatted percentage string
 */
export function formatPercentage(value: number, decimalPlaces: number = 1): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 * @param str The string to truncate
 * @param length The maximum length of the truncated string
 * @returns The truncated string
 */
export function truncateString(str: string, length: number = 50): string {
  if (!str || str.length <= length) return str;
  return `${str.substring(0, length).trim()}...`;
}

/**
 * Generates a random ID string
 * @returns A random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Debounces a function
 * @param fn The function to debounce
 * @param ms The debounce delay in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Deep clones an object
 * @param obj The object to clone
 * @returns A deep copy of the object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Groups an array of objects by a specified key
 * @param array The array to group
 * @param key The key to group by
 * @returns An object with groups
 */
export function groupBy<T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Extracts specific properties from an object to create a new object
 * @param obj The source object
 * @param keys The keys to extract
 * @returns A new object with only the specified properties
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omits specific properties from an object to create a new object
 * @param obj The source object
 * @param keys The keys to omit
 * @returns A new object without the specified properties
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}