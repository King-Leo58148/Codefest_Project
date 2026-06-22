/**
 * User role definitions and permissions
 */

// Role types
export type UserRole = 'investor' | 'business';

// Role configuration
export const ROLE_CONFIG = {
  investor: {
    id: 'investor' as const,
    title: 'Investor',
    description: 'Discover and invest in promising businesses',
    gradientColors: ['#4F46E5', '#7C3AED'] as const,
    primaryColor: '#4F46E5',
    features: [
      'Access vetted opportunities',
      'Diversify your portfolio',
      'Track investments',
      'Earn competitive returns',
    ],
  },
  business: {
    id: 'business' as const,
    title: 'Business Owner',
    description: 'Get funding to grow your business',
    gradientColors: ['#10B981', '#059669'] as const,
    primaryColor: '#10B981',
    features: [
      'Connect with investors',
      'Quick funding process',
      'Business mentorship',
      'Network opportunities',
    ],
  },
} as const;

// Role options for selection (derived from ROLE_CONFIG)
export const ROLE_OPTIONS = [
  ROLE_CONFIG.investor,
  ROLE_CONFIG.business,
] as const;

// Role labels (readable names)
export const ROLE_LABELS: Record<UserRole, string> = {
  investor: 'Investor',
  business: 'Business Owner',
};

// Role route mappings
export const ROLE_ROUTES: Record<UserRole, string> = {
  investor: '/(investor)/home',
  business: '/(business)/home',
};

// Role dashboard titles
export const ROLE_DASHBOARD_TITLES: Record<UserRole, string> = {
  investor: 'Investment Opportunities',
  business: 'Your Pitches',
};

// Role feature icons mapping
export const ROLE_FEATURE_ICONS = {
  access: 'shield',
  diversify: 'pie-chart',
  track: 'bar-chart',
  returns: 'trending-up',
  connect: 'users',
  funding: 'dollar-sign',
  mentorship: 'book',
  network: 'globe',
} as const;

// Role permissions
export const ROLE_PERMISSIONS = {
  investor: [
    'browse_pitches',
    'place_bids',
    'view_deals',
    'message_businesses',
    'view_investment_history',
    'edit_profile',
  ],
  business: [
    'create_pitch',
    'edit_pitch',
    'delete_pitch',
    'view_bids',
    'accept_bid',
    'decline_bid',
    'send_counter_offer',
    'view_deals',
    'sign_documents',
    'message_investors',
    'edit_profile',
  ],
} as const;

// Role-specific API endpoints
export const ROLE_ENDPOINTS = {
  investor: {
    pitches: '/pitches',
    bids: '/bids/placed',
    deals: '/deals',
  },
  business: {
    pitches: '/pitches',
    bids: '/bids/received',
    deals: '/deals',
  },
} as const;

// Get role from storage/local
export function getStoredRole(): UserRole | null {
  // This would typically use AsyncStorage or SecureStore
  if (typeof window === 'undefined') return null;
  return null;
}

// Validate if user has permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role].includes(permission as any);
}

// Get all role permissions
export function getRolePermissions(role: UserRole): readonly string[] {
  return ROLE_PERMISSIONS[role];
}