import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names and merges Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount with a currency symbol
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a date in a readable format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncates a string if it's longer than the specified length
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Extracts the initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Generates a simple ID for temporary usage
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Format percentage with appropriate sign and decimals
 */
export function formatPercentage(value: number, decimals = 1): string {
  const formatted = value.toFixed(decimals);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
}

/**
 * Calculate savings percentage from original and new price
 */
export function calculateSavings(originalPrice: number, newPrice: number): number {
  if (originalPrice === 0) return 0;
  return ((originalPrice - newPrice) / originalPrice) * 100;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}