/**
 * Formatting utilities for various data types
 */

// Format currency values
export function formatCurrency(amount: number, compact = false): string {
  if (amount === null || amount === undefined) return '$0';
  
  if (compact && amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  
  if (compact && amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  
  return `$${amount.toLocaleString()}`;
}

// Format currency input (removes $ and commas for input parsing)
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return Number(cleaned) || 0;
}

// Format large numbers with abbreviations
export function formatNumber(value: number, compact = true): string {
  if (value === null || value === undefined) return '0';
  
  if (compact) {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${Math.round(value / 1_000)}K`;
    }
  }
  
  return value.toLocaleString();
}

// Format date in short format (e.g., "Jan 15, 2024")
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format date in medium format (e.g., "January 15, 2024")
export function formatDateLong(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format date in short format without year (e.g., "Jan 15")
export function formatDateShort(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

// Format relative date/time
export function formatRelativeDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes <= 0) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

// Format time (e.g., "2:30 PM")
export function formatTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Format percentage
export function formatPercent(value: number, decimals = 0): string {
  const percent = value * 100;
  if (decimals === 0) {
    return `${Math.round(percent)}%`;
  }
  return `${percent.toFixed(decimals)}%`;
}

// Format phone number
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

// Format phone input (digits only)
export function parsePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

// Format initials from name
export function formatInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// Format duration (e.g., "2d 3h 15m")
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0 && parts.length === 0) parts.push(`${seconds % 60}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
}

// Capitalize first letter
export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Title case (capitalize each word)
export function titleCase(value: string): string {
  if (!value) return value;
  return value
    .split(' ')
    .map((word) => capitalize(word.toLowerCase()))
    .join(' ');
}

// Truncate text with ellipsis
export function truncate(value: string, maxLength: number): string {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + '...';
}

// Format decimal places
export function formatDecimal(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

// Format with suffix (e.g., "+$5K", "-$12%")
export function formatChange(value: number, formatAsPercent = false): string {
  const sign = value >= 0 ? '+' : '';
  const formatted = formatAsPercent ? formatPercent(Math.abs(value)) : formatCurrency(Math.abs(value));
  return `${sign}${formatted}`;
}