/**
 * Application configuration and environment settings
 */

// Environment detection
export const IS_DEV = __DEV__ || process.env.NODE_ENV === 'development';
export const IS_PROD = !IS_DEV;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.investormatch.com/v1',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'InvestorMatch',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUNDLE_IDENTIFIER: 'com.investormatch.app',
  SPLASH_BG_COLOR: '#208AEF',
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  ONBOARDING_KEY: 'onboarding_completed',
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_PHOTO_SIZE_MB: 5,
  MAX_PHOTO_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_VIDEO_SIZE_BYTES: 50 * 1024 * 1024,
  ALLOWED_PHOTO_TYPES: ['jpg', 'jpeg', 'png'],
  ALLOWED_VIDEO_TYPES: ['mp4', 'mov', 'avi'],
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
  DEFAULT_DURATION: 300,
  FAST_DURATION: 150,
  SLOW_DURATION: 500,
} as const;

// Form Configuration
export const FORM_CONFIG = {
  DEBOUNCE_DELAY: 500,
  VALIDATION_DEBOUNCE: 300,
} as const;

// UI Configuration
export const UI_CONFIG = {
  MAX_TAGS: 5,
  MAX_TAG_LENGTH: 20,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  USER_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  PITCH_CACHE_TIME: 2 * 60 * 1000, // 2 minutes
  BIDS_CACHE_TIME: 60 * 1000, // 1 minute
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: IS_DEV ? false : true,
  ENABLE_ANALYTICS: IS_PROD,
  ENABLE_CRASH_REPORTING: IS_PROD,
} as const;

// Deep linking configuration
export const DEEP_LINKING_CONFIG = {
  SCHEME: 'myapp',
  PREFIX: 'https://investormatch.com',
} as const;

// External links
export const EXTERNAL_LINKS = {
  PRIVACY_POLICY: 'https://investormatch.com/privacy',
  TERMS_OF_SERVICE: 'https://investormatch.com/terms',
  SUPPORT_EMAIL: 'support@investormatch.com',
  SUPPORT_URL: 'https://investormatch.com/support',
} as const;