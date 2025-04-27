import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function calculateSavings(initialOffer: number, finalOffer: number): number {
  if (!initialOffer || !finalOffer) return 0;
  return ((initialOffer - finalOffer) / initialOffer) * 100;
}

export function getRatingLabel(rating: number): string {
  const labels = [
    'Poor',
    'Below Average',
    'Average',
    'Good',
    'Excellent',
  ];
  const index = Math.min(Math.max(Math.round(rating) - 1, 0), 4);
  return labels[index];
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'text-yellow-500 bg-yellow-50',
    active: 'text-blue-500 bg-blue-50',
    completed: 'text-green-500 bg-green-50',
    rejected: 'text-red-500 bg-red-50',
    expired: 'text-gray-500 bg-gray-50',
    draft: 'text-gray-500 bg-gray-50',
    signed: 'text-green-500 bg-green-50',
  };
  
  return statusColors[status.toLowerCase()] || 'text-gray-500 bg-gray-50';
}

export function getRandomId(): string {
  return Math.random().toString(36).substring(2, 10);
}