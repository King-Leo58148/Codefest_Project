/**
 * Form validation utilities
 * Reusable validator functions for form input validation
 */

export type Validator<T = any> = (value: T) => string | undefined;

/**
 * Required field validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const required = (message = 'This field is required'): Validator => (value) => {
  if (value === undefined || value === null || value === '') {
    return message;
  }
  if (Array.isArray(value) && value.length === 0) {
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
    return undefined;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\0-9\s@]+$/;
  if (typeof value === 'string' && !emailRegex.test(value)) {
    return message;
  }
  return undefined;
};

/**
 * Phone number validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const phone = (message = 'Invalid phone number'): Validator => (value) => {
  if (!value) {
    return undefined;
  }
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (typeof value === 'string' && !phoneRegex.test(value)) {
    return message;
  }
  return undefined;
};

/**
 * URL validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const url = (message = 'Invalid URL'): Validator => (value) => {
  if (!value) {
    return undefined;
  }
  try {
    new URL(value);
    return undefined;
  } catch {
    return message;
  }
};

/**
 * Minimum length validator
 * @param min Minimum length
 * @param message Optional custom error message
 * @returns Validator function
 */
export const minLength = (min: number, message?: string): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined;
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
    return undefined;
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
export const numeric = (message = 'Must be a valid number'): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined;
  }
  if (isNaN(Number(value))) {
    return message;
  }
  return undefined;
};

/**
 * Positive number validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const positive = (message = 'Must be a positive number'): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined;
  }
  if (Number(value) <= 0) {
    return message;
  }
  return undefined;
};

/**
 * Integer validator
 * @param message Optional custom error message
 * @returns Validator function
 */
export const integer = (message = 'Must be a whole number'): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined;
  }
  if (!Number.isInteger(Number(value))) {
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
    return undefined;
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
    return undefined;
  }
  if (Number(value) > max) {
    return message || `Must be at most ${max}`;
  }
  return undefined;
};

/**
 * Range validator (for numbers)
 * @param min Minimum value
 * @param max Maximum value
 * @param message Optional custom error message
 * @returns Validator function
 */
export const range = (min: number, max: number, message?: string): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined;
  }
  const num = Number(value);
  if (num < min || num > max) {
    return message || `Must be between ${min} and ${max}`;
  }
  return undefined;
};

/**
 * Pattern validator (regex)
 * @param regex Regular expression to test against
 * @param message Optional custom error message
 * @returns Validator function
 */
export const pattern = (regex: RegExp, message = 'Invalid format'): Validator => (value) => {
  if (!value) {
    return undefined;
  }
  if (!regex.test(String(value))) {
    return message;
  }
  return undefined;
};

/**
 * Password strength validator
 * Requires minimum 8 characters, at least one uppercase, one lowercase, one number
 * @param message Optional custom error message
 * @returns Validator function
 */
export const passwordStrength = (
  message = 'Password must be at least 8 characters with uppercase, lowercase, and number'
): Validator => (value) => {
  if (!value) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return message;
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/\d/.test(value)) {
    return 'Password must contain at least one number';
  }
  return undefined;
};

/**
 * Confirm password validator
 * @param getPasswordValue Function that returns the password value to confirm against
 * @param message Optional custom error message
 * @returns Validator function
 */
export const confirmPassword = (
  getPasswordValue: () => string,
  message = 'Passwords do not match'
): Validator => (value) => {
  if (!value && value !== 0) {
    return undefined;
  }
  if (value !== getPasswordValue()) {
    return message;
  }
  return undefined;
};

/**
 * Compose multiple validators
 * @param validators Array of validator functions
 * @returns Combined validator function
 */
export const composeValidators = (...validators: Validator[]): Validator => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return undefined;
};

/**
 * Run all validators and return all errors
 * @param validators Array of validator functions
 * @returns Combined validator function returning first error or undefined
 */
export const validateAll = (...validators: Validator[]): Validator => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return undefined;
};

/**
 * Validate an entire form object
 * @param formData The form data object
 * @param validators Map of field names to validator functions
 * @returns Object with field errors
 */
export const validateForm = <T extends Record<string, any>>(
  formData: T,
  validators: Record<string, Validator | Validator[]>
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const [field, fieldValidators] of Object.entries(validators)) {
    if (!formData.hasOwnProperty(field)) continue;

    const validatorList = Array.isArray(fieldValidators) ? fieldValidators : [fieldValidators];
    const value = formData[field as keyof T];

    for (const validator of validatorList) {
      const error = validator(value);
      if (error) {
        errors[field as keyof T] = error;
        break;
      }
    }
  }

  return errors;
};