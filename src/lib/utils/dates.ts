// lib/utils/dates.ts

/**
 * Add months to a date
 * @param date - Starting date
 * @param months - Number of months to add
 * @returns New date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date to readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date to short string (e.g., "Jan 20, 2026")
 * @param date - Date to format
 * @returns Short formatted date string
 */
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO formatted date string
 */
export function formatDateISO(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date | string): boolean {
  const today = new Date();
  const d = new Date(date);
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const now = new Date();
  const d = new Date(date);
  return d < now;
}

/**
 * Check if date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const now = new Date();
  const d = new Date(date);
  return d > now;
}

/**
 * Get days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get days until a date
 * @param date - Target date
 * @returns Number of days until date (negative if past)
 */
export function daysUntil(date: Date | string): number {
  const now = new Date();
  const d = new Date(date);
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format time ago (e.g., "2 hours ago", "3 days ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return 'just now';
}

/**
 * Get start of day (midnight)
 * @param date - Date to process
 * @returns Date set to midnight
 */
export function startOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59.999)
 * @param date - Date to process
 * @returns Date set to end of day
 */
export function endOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get first day of month
 * @param date - Date to process
 * @returns First day of the month
 */
export function startOfMonth(date: Date | string): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Get last day of month
 * @param date - Date to process
 * @returns Last day of the month
 */
export function endOfMonth(date: Date | string): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}