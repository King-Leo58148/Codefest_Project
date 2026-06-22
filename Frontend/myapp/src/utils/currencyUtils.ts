/**
 * Currency utilities for formatting and calculations
 */

// Default currency settings
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = undefined;

// Format currency with locale support
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string | undefined = DEFAULT_LOCALE,
  compact = false
): string {
  if (amount === null || amount === undefined) return '$0';
  
  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `${amount < 0 ? '-' : ''}$${Math.abs(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `${amount < 0 ? '-' : ''}$${Math.abs(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${amount < 0 ? '-' : ''}$${Math.abs(Math.round(amount / 1_000))}K`;
    }
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format currency with decimals
export function formatCurrencyPrecise(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string | undefined = DEFAULT_LOCALE,
  decimalPlaces = 2
): string {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount);
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

// Format currency for input (removes formatting)
export function formatCurrencyInput(value: string): string {
  const num = parseCurrency(value);
  return num.toLocaleString();
}

// Calculate percentage of a value relative to total
export function calculatePercent(amount: number, total: number): number {
  if (total === 0) return 0;
  return (amount / total) * 100;
}

// Calculate percentage change between two values
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

// Format percentage with sign
export function formatPercentWithSign(value: number, decimals = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

// Format large numbers (not currency) with abbreviations
export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined) return '0';
  
  const abs = Math.abs(value);
  
  if (abs >= 1_000_000_000) {
    return `${value < 0 ? '-' : ''}${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${value < 0 ? '-' : ''}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${value < 0 ? '-' : ''}${Math.round(abs / 1_000)}K`;
  }
  
  return value.toLocaleString();
}

// Convert to monthly payment (loan calculator style)
export function monthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return principal / months;
  }
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
    (Math.pow(1 + monthlyRate, months) - 1);
}

// Calculate total interest paid
export function totalInterest(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthly = monthlyPayment(principal, annualRate, years);
  return monthly * years * 12 - principal;
}

// Round to nearest cent
export function roundToCent(value: number): number {
  return Math.round(value * 100) / 100;
}

// Round to nearest dollar
export function roundToDollar(value: number): number {
  return Math.round(value);
}

// Clamp value to range
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Sum array of numbers
export function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + (val || 0), 0);
}

// Average of array of numbers
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

// Median of array of numbers
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Currency symbol map
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CNY: '¥',
  INR: '₹',
};

// Get currency symbol
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

// Split amount into dollars and cents
export function splitDollarsCents(amount: number): { dollars: number; cents: number } {
  const dollars = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - dollars) * 100);
  return { dollars, cents };
}

// Format for accounting (negative in parentheses)
export function formatAccounting(value: number): string {
  if (value < 0) {
    return `(${formatCurrency(Math.abs(value))})`;
  }
  return formatCurrency(value);
}