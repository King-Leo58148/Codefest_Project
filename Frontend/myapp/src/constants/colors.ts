/**
 * Application colors and theme tokens
 * Based on codebase color patterns from LoginScreen, business screens, and modals
 */

// Brand colors
export const BRAND = {
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  primaryDark: '#4338CA',
  secondary: '#0EA5E5',
  secondaryDark: '#0284C7',
} as const;

// Business app colors
export const BUSINESS = {
  primary: '#10B981',
  primaryDark: '#059669',
  background: '#F3F4F6',
  text: '#1E1B4B',
  muted: '#6B7280',
  surface: '#FFFFFF',
} as const;

// Semantic colors
export const SEMANTIC = {
  success: '#10B981',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',
} as const;

// Status colors
export const STATUS = {
  pending: '#F59E0B',
  accepted: '#10B981',
  declined: '#EF4444',
  active: '#10B981',
  draft: '#6B7280',
  funded: '#4F46E5',
  closed: '#EF4444',
  pendingSignature: '#F59E0B',
} as const;

// Neutral scale (Tailwind-like)
export const NEUTRAL = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

// Text colors
export const TEXT = {
  primary: '#111827',
  secondary: '#4B5563',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  inverse: '#FFFFFF',
} as const;

// Background colors
export const BACKGROUND = {
  primary: '#FFFFFF',
  secondary: '#F9FAFB',
  tertiary: '#F3F4F6',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

// Border colors
export const BORDER = {
  primary: '#E5E7EB',
  secondary: '#D1D5DB',
  focus: '#4F46E5',
  error: '#FECACA',
} as const;

// Social brand colors
export const SOCIAL = {
  facebook: '#2563EB',
  twitter: '#38A7F2',
  google: '#EF4444',
} as const;

// Gradients (for LinearGradient components)
export const GRADIENTS = {
  primary: ['#4A6CF7', '#1A2A6C'],
  business: ['#10B981', '#059669'],
  success: ['#10B981', '#059669'],
} as const;

// Opacity variants
export const OPACITY = {
  light: 'rgba(255, 255, 255, 0.2)',
  medium: 'rgba(255, 255, 255, 0.32)',
  dark: 'rgba(0, 0, 0, 0.5)',
} as const;