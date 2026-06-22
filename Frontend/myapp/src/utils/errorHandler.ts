import React from 'react';

/**
 * Error handling utilities for consistent error management
 */

// Custom error types
export type ErrorType = 'network' | 'validation' | 'server' | 'unknown' | 'auth';

export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  details?: Record<string, any>;
}

// Create a typed error
export function createError(
  type: ErrorType,
  message: string,
  code?: string,
  details?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.code = code;
  error.details = details;
  return error;
}

// Parse error message from various error sources
export function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

// Parse error type from various error sources
export function parseErrorType(error: unknown): ErrorType {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof (error as any).code === 'string') {
      const code = (error as any).code;
      if (code.startsWith('auth') || code === '401' || code === '403') {
        return 'auth';
      }
      if (code === 'network' || code.includes('Network')) {
        return 'network';
      }
    }
  }
  
  const message = parseErrorMessage(error).toLowerCase();
  if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
    return 'network';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  
  return 'unknown';
}

// Handle API errors
export function handleApiError(response: Response): Promise<AppError> {
  return response.json().then((data) => {
    const message = data.message || data.error || `Request failed with status ${response.status}`;
    return createError(
      response.status === 401 ? 'auth' : 'server',
      message,
      String(response.status),
      data
    );
  }).catch(() => {
    return createError('network', `Network error: Unable to reach server`);
  });
}

// Log error with context
export function logError(error: unknown, context?: string): void {
  const message = parseErrorMessage(error);
  const type = parseErrorType(error);
  
  console.error(`[${context || 'App'}] ${type.toUpperCase()}: ${message}`, {
    error,
    timestamp: new Date().toISOString(),
  });
}

// Async wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    logError(error, context);
    return { error: error instanceof Error ? createError(parseErrorType(error), error.message) : createError('unknown', String(error)) };
  }
}

// Handle form validation errors
export function handleValidationErrors<T extends Record<string, any>>(
  errors: Partial<Record<keyof T, string>>
): string {
  const errorMessages = Object.values(errors).filter(Boolean);
  return errorMessages.length > 0 
    ? errorMessages.join('\n') 
    : 'Please fix the validation errors';
}

// Retry operation with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

// Sleep utility (needed for retry)
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: unknown): string {
  const type = parseErrorType(error);
  
  switch (type) {
    case 'network':
      return 'Please check your internet connection and try again.';
    case 'auth':
      return 'Your session has expired. Please sign in again.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'server':
      return 'Our servers are experiencing issues. Please try again later.';
    default:
      return parseErrorMessage(error);
  }
}

// Error boundary helper
export function getErrorInfo(error: Error, errorInfo?: React.ErrorInfo): string {
  const parts: string[] = [error.toString()];
  if (errorInfo?.componentStack) {
    parts.push('\nComponent Stack:', errorInfo.componentStack);
  }
  return parts.join('\n');
}