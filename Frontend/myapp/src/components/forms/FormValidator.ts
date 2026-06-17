/**
 * Form validation utilities
 */

export type Validator = (value: any) => string | undefined;

/**
 * Required field validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const required = (message = 'This field is required'): Validator => (value) => {
  if (value === undefined || value === null || value === '') {
    return message;
  }
  return undefined;
};

/**
 * Email validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const email = (message = 'Invalid email address'): Validator => (value) => {
  if (!value) {
    return undefined; // Let required validator handle empty values
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return message;
  }
  return undefined;
};

/**
 * Minimum length validator
 * @param min Minimum length
 * @param message Optional custom error message
 * @returns Validator function
 */
export const minLength = (min: number, message?: string): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined; // Let required validator handle empty values
  }
  if (String(value).length < min) {
    return message || `Must be at least ${min} characters`;
  }
  return undefined;
};

/**
 * Maximum length validator
 * @param max Maximum length
 * @param message Optional custom error message
 * @returns Validator function
 */
export const maxLength = (max: number, message?: string): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined; // Let required validator handle empty values
  }
  if (String(value).length > max) {
    return message || `Must be at most ${max} characters`;
  }
  return undefined;
};

/**
 * Numeric validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const numeric = (message = 'Must be a number'): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined; // Let required validator handle empty values
  }
  if (isNaN(Number(value))) {
    return message;
  }
  return undefined;
};

/**
 * Minimum value validator (for numbers)
 * @param min Minimum value
 * @param message Optional custom error message
 * @returns Validator function
 */
export const minValue = (min: number, message?: string): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined; // Let required validator handle empty values
  }
  if (Number(value) < min) {
    return message || `Must be at least ${min}`;
  }
  return undefined;
};

/**
 * Maximum value validator (for numbers)
 * @param max Maximum value
 * @param message Optional custom error message
 * @returns Validator function
 */
export const maxValue = (max: number, message?: string): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined; // Let required validator handle empty values
  }
  if (Number(value) > max) {
    return message || `Must be at most ${max}`;
  }
  return undefined;
};

/**
 * Pattern validator (regex)
 * @param pattern Regular expression to test against
 * @param message Optional custom error message
 * @returns Validator function
 */
export const pattern = (pattern: RegExp, message = 'Invalid format'): Validator => (value) => {
  if (!value) {
    return undefined; // Let required validator handle empty values
  }
  if (!pattern.test(value)) {
    return message;
  }
  return undefined;
};

/**
 * Confirm password validator
 * @param getPasswordValue Function that returns the password value to confirm against
 * @param message Optional custom error message
 * @returns Validator function
 */
export const confirm = (getPasswordValue: () => string, message = 'Passwords do not match'): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined; // Let required validator handle empty values
  }
  if (value !== getPasswordValue()) {
    return message;
  }
  return undefined;
};
