import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatPercentage(value: number, digitsAfterDecimal = 1) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: digitsAfterDecimal,
    maximumFractionDigits: digitsAfterDecimal, 
  }).format(value / 100)
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getInitials(name?: string): string {
  if (!name) return ""
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function calculateSavings(initialAmount: number, finalAmount: number): number {
  if (initialAmount <= 0) return 0
  const savings = initialAmount - finalAmount
  return Math.max(0, savings)
}

export function calculateSavingsPercentage(initialAmount: number, finalAmount: number): number {
  if (initialAmount <= 0) return 0
  const savings = initialAmount - finalAmount
  return (savings / initialAmount) * 100
}

export function generateStarRating(score: number): {
  stars: number,
  description: string
} {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score))
  
  // Convert to 0-5 star rating
  const stars = Math.round(normalizedScore / 20)
  
  // Generate description based on star rating
  let description = ""
  switch (stars) {
    case 0:
      description = "Poor"
      break
    case 1:
      description = "Below expectations"
      break
    case 2:
      description = "Fair"
      break
    case 3:
      description = "Good"
      break
    case 4:
      description = "Very good"
      break
    case 5:
      description = "Excellent"
      break
    default:
      description = "Not rated"
  }
  
  return { stars, description }
}