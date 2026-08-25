import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(date: string | Date, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: string | Date, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Capitalize first letter.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

/**
 * Get status badge color class based on status.
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    // Active/success states
    active: 'bg-success/10 text-success',
    confirmed: 'bg-success/10 text-success',
    verified: 'bg-success/10 text-success',
    synced: 'bg-success/10 text-success',
    published: 'bg-success/10 text-success',
    // Warning states
    pending: 'bg-warning/10 text-warning-foreground',
    under_review: 'bg-warning/10 text-warning-foreground',
    draft: 'bg-warning/10 text-warning-foreground',
    // Info states
    submitted: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-blue-100 text-blue-800',
    offer_sent: 'bg-blue-100 text-blue-800',
    // Destructive states
    rejected: 'bg-destructive/10 text-destructive',
    cancelled: 'bg-destructive/10 text-destructive',
    withdrawn: 'bg-destructive/10 text-destructive',
    expelled: 'bg-destructive/10 text-destructive',
    failed: 'bg-destructive/10 text-destructive',
    // Default
    default: 'bg-secondary text-secondary-foreground',
  };

  return colorMap[status] || colorMap.default;
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
