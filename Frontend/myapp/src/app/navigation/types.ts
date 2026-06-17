// src/app/navigation/types.ts

// Define parameter types for different screens
export type RootStackParamList = {
  // Auth screens
  index: undefined;
  '(auth)/register': { role?: string };
  '(auth)/login': undefined;
  '(auth)/choose-role': undefined;
  
  // App screens (will be nested navigators)
  '(app)': undefined;
  
  // Investor screens
  '(investor)/home': undefined;
  '(investor)/deals': undefined;
  '(investor)/place-bid': undefined;
  '(investor)/pitch-detail': { pitchId: string };
  
  // Business screens
  '(business)/home': undefined;
  '(business)/deals': undefined;
  '(business)/bids': undefined;
  '(business)/post-pitch': undefined;
};

// Define parameter types for investor navigator
export type InvestorStackParamList = {
  home: undefined;
  deals: undefined;
  'place-bid': undefined;
  'pitch-detail': { pitchId: string };
};

// Define parameter types for business navigator
export type BusinessStackParamList = {
  home: undefined;
  deals: undefined;
  bids: undefined;
  'post-pitch': undefined;
};

// Define parameter types for shared navigator (if needed)
export type SharedStackParamList = {
  // Add any shared screens here
  // For example:
  // 'settings': undefined;
  // 'profile': undefined;
};