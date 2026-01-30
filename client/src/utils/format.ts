/**
 * Format a number with locale-specific thousands separators
 * @example formatNumber(1234567) // "1,234,567"
 */
export const formatNumber = (num: number): string => num.toLocaleString();

/**
 * Format a date/timestamp to locale string (Balance components)
 * @example formatBalanceDateTime('2024-01-15T10:30:00Z') // "1/15/2024, 10:30:00 AM"
 */
export const formatBalanceDateTime = (date: Date | string): string => new Date(date).toLocaleString();
