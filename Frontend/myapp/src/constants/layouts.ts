/**
 * Layout dimensions, spacing, and common style patterns
 */

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

// Border radius scale
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
  pill: 9999,
} as const;

// Avatar sizes
export const AVATAR_SIZE = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 44,
  xl: 56,
  xxl: 80,
} as const;

// Icon sizes
export const ICON_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 22,
  xxl: 24,
  huge: 48,
} as const;

// Font sizes
export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 22,
  huge: 28,
  massive: 36,
} as const;

// Heights
export const HEIGHT = {
  button: 44,
  buttonLarge: 52,
  input: 38,
  inputLarge: 48,
  header: 56,
  hero: 275,
  tabBar: 80,
} as const;

// Common layout styles (as objects for reuse)
export const LAYOUT_STYLES = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  col: {
    flexDirection: 'column' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  flex1: {
    flex: 1,
  },
  fullWidth: {
    width: '100%' as const,
  },
  scrollContent: {
    flexGrow: 1,
  },
} as const;

// Safe area edge sets
export const SAFE_AREA_EDGES = {
  all: ['top', 'bottom', 'left', 'right'] as const,
  top: ['top'] as const,
  topHorizontal: ['top', 'left', 'right'] as const,
} as const;

// Shadow presets
export const SHADOWS = {
  small: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  large: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

// Card styles
export const CARD_STYLES = {
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
  },
  withShadow: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

// Button styles
export const BUTTON_STYLES = {
  base: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: RADIUS.md,
    minHeight: HEIGHT.button,
  },
  large: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: RADIUS.md,
    minHeight: HEIGHT.buttonLarge,
  },
  icon: {
    width: HEIGHT.button,
    height: HEIGHT.button,
    borderRadius: RADIUS.round,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
} as const;