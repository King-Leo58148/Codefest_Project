/**
 * Application constants and default values
 */

// App metadata
export const APP_NAME = 'InvestorMatch';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const;

// API endpoints (relative to base URL)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER_BUSINESS: '/auth/register/business',
    REGISTER_INVESTOR: '/auth/register/investor',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PITCHES: {
    LIST: '/pitches',
    CREATE: '/pitches',
    UPDATE: (id: string) => `/pitches/${id}`,
    DELETE: (id: string) => `/pitches/${id}`,
    DETAILS: (id: string) => `/pitches/${id}`,
  },
  BIDS: {
    LIST: '/bids',
    CREATE: '/bids',
    ACCEPT: (id: string) => `/bids/${id}/accept`,
    DECLINE: (id: string) => `/bids/${id}/decline`,
    COUNTER: (id: string) => `/bids/${id}/counter`,
  },
  DEALS: {
    LIST: '/deals',
    DETAILS: (id: string) => `/deals/${id}`,
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  DESCRIPTION_MIN: 40,
  DESCRIPTION_MAX: 2000,
  PITCH_GOAL_MIN: 1000,
  PITCH_GOAL_MAX: 100_000_000,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  PHONE_MIN: 10,
  PHONE_MAX: 15,
} as const;

// UI constants
export const UI = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  MAX_PHOTO_SIZE_MB: 5,
  MAX_PHOTO_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_VIDEO_SIZE_BYTES: 50 * 1024 * 1024,
  ITEMS_PER_PAGE: 20,
  MAX_TAGS: 5,
} as const;

// Pitch categories
export const PITCH_CATEGORIES = [
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Clean Energy', value: 'clean_energy' },
  { label: 'Consumer', value: 'consumer' },
  { label: 'Fintech', value: 'fintech' },
  { label: 'Other', value: 'other' },
] as const;

// Pitch durations (in days)
export const PITCH_DURATIONS = [
  { label: '30 days', value: '30' },
  { label: '60 days', value: '60' },
  { label: '90 days', value: '90' },
  { label: '120 days', value: '120' },
  { label: '6 months', value: '180' },
  { label: '1 year', value: '365' },
] as const;

// Deal statuses
export const DEAL_STATUSES = [
  { label: 'Active', value: 'active', color: '#0EA5E9' },
  { label: 'Completed', value: 'completed', color: '#10B981' },
  { label: 'Pending Signature', value: 'pending_signature', color: '#F59E0B' },
] as const;

// Pitch statuses
export const PITCH_STATUSES = [
  { label: 'Active', value: 'active', color: '#10B981' },
  { label: 'Draft', value: 'draft', color: '#6B7280' },
  { label: 'Funded', value: 'funded', color: '#4F46E5' },
  { label: 'Closed', value: 'closed', color: '#EF4444' },
] as const;

// Bid statuses
export const BID_STATUSES = [
  { label: 'Pending', value: 'pending', color: '#F59E0B' },
  { label: 'Accepted', value: 'accepted', color: '#10B981' },
  { label: 'Declined', value: 'declined', color: '#EF4444' },
] as const;

// Roles
export const USER_ROLES = {
  BUSINESS: 'business',
  INVESTOR: 'investor',
} as const;

// Navigation routes
export const ROUTES = {
  AUTH: '/(auth)',
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',
  CHOOSE_ROLE: '/(auth)/choose-role',
  BUSINESS_HOME: '/(business)/home',
  BUSINESS_BIDS: '/(business)/bids',
  BUSINESS_DEALS: '/(business)/deals',
  POST_PITCH: '/(business)/post-pitch',
  INVESTOR_HOME: '/(investor)/home',
  INVESTOR_PITCH_DETAIL: '/(investor)/pitch-detail',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  AUTH_ERROR: 'Your session has expired. Please sign in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PITCH_CREATED: 'Your pitch has been published and is now visible to investors.',
  BID_ACCEPTED: 'Bid accepted successfully. A deal has been created.',
  BID_DECLINED: 'Bid declined successfully.',
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  DOCUMENT_SIGNED: 'Document signed successfully. The deal is now active.',
} as const;