/**
 * Typography scale and text styles for consistent UI
 */

// Font families
export const FONT_FAMILY = {
  system: 'System',
  mono: 'Menlo',
} as const;

// Font weights mapping (React Native style values)
export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// Text variants with sizes and weights
export const TEXT_VARIANTS = {
  // Display/Text headers
  displayLarge: {
    fontSize: 36,
    fontWeight: FONT_WEIGHT.extrabold,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.extrabold,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontSize: 24,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 32,
  },
  
  // Headings
  heading1: {
    fontSize: 24,
    fontWeight: FONT_WEIGHT.extrabold,
    lineHeight: 32,
  },
  heading2: {
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: FONT_WEIGHT.semibold,
    lineHeight: 24,
  },
  
  // Body text
  bodyLarge: {
    fontSize: 18,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: 20,
  },
  
  // Labels and captions
  label: {
    fontSize: 15,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.semibold,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: 14,
  },
} as const;

// Text colors (semantic)
export const TEXT_COLORS = {
  primary: '#111827',
  secondary: '#4B5563',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  disabled: '#D1D5DB',
  inverse: '#FFFFFF',
  link: '#4F46E5',
  linkHover: '#6366F1',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

// Predefined text styles (combining variants with colors)
export const TEXT_STYLES = {
  // Headings
  h1: { ...TEXT_VARIANTS.heading1, color: TEXT_COLORS.primary },
  h2: { ...TEXT_VARIANTS.heading2, color: TEXT_COLORS.primary },
  h3: { ...TEXT_VARIANTS.heading3, color: TEXT_COLORS.primary },
  
  // Body
  body: { ...TEXT_VARIANTS.body, color: TEXT_COLORS.primary },
  bodyLarge: { ...TEXT_VARIANTS.bodyLarge, color: TEXT_COLORS.primary },
  bodySmall: { ...TEXT_VARIANTS.bodySmall, color: TEXT_COLORS.secondary },
  
  // Labels
  label: { ...TEXT_VARIANTS.label, color: TEXT_COLORS.muted },
  labelLarge: { fontSize: 20, fontWeight: FONT_WEIGHT.bold, color: TEXT_COLORS.primary },
  
  // Captions
  caption: { ...TEXT_VARIANTS.caption, color: TEXT_COLORS.muted },
  captionSmall: { ...TEXT_VARIANTS.captionSmall, color: TEXT_COLORS.subtle },
  
  // Muted text
  muted: { fontSize: 14, fontWeight: FONT_WEIGHT.regular, color: TEXT_COLORS.muted },
  mutedSmall: { fontSize: 12, fontWeight: FONT_WEIGHT.regular, color: TEXT_COLORS.muted },
  
  // Links
  link: { fontSize: 14, fontWeight: FONT_WEIGHT.semibold, color: TEXT_COLORS.link },
  linkSmall: { fontSize: 12, fontWeight: FONT_WEIGHT.semibold, color: TEXT_COLORS.link },
  
  // Special
  button: { fontSize: 15, fontWeight: FONT_WEIGHT.bold },
  buttonLarge: { fontSize: 16, fontWeight: FONT_WEIGHT.bold },
  error: { fontSize: 12, fontWeight: FONT_WEIGHT.regular, color: TEXT_COLORS.error },
  success: { fontSize: 14, fontWeight: FONT_WEIGHT.medium, color: TEXT_COLORS.success },
} as const;

// Helper to create styled text props
export function getTextStyles(
  variant: keyof typeof TEXT_STYLES,
  color?: string,
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify',
  alignContent?: 'auto' | 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
) {
  const styles = TEXT_STYLES[variant];
  return {
    ...styles,
    ...(color ? { color } : {}),
    ...(align ? { textAlign: align } : {}),
    ...(alignContent ? { textAlignVertical: alignContent } : {}),
  };
}