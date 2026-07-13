export type UserRole = 'INVESTOR' | 'OWNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  emailVerified?: boolean;
  ghanaCardVerified: boolean;
  momoVerified: boolean;
  momoNumber?: string;
  ghanaCardNumber?: string;
}

export type PitchStatus = 'PENDING' | 'LIVE' | 'FUNDED' | 'EXPIRED' | 'REJECTED';
export type OfferType = 'EQUITY' | 'REVENUE_SHARE' | 'FIXED';
export type ReturnType = 'EQUITY' | 'REVENUE_SHARE' | 'FIXED';
export type BidStatus = 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED';
export type DealStatus =
  | 'PENDING_SIGNATURES'
  | 'PENDING_MFI'
  | 'MFI_APPROVED'
  | 'PAYMENT_PENDING'
  | 'FUNDED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DEFAULTED'
  | 'CANCELLED';
export type RepaymentStatus = 'PENDING' | 'COLLECTED' | 'MISSED';

export type Industry =
  | 'All'
  | 'Technology'
  | 'Food & Bev'
  | 'Health'
  | 'Sustainability'
  | 'Fitness'
  | 'Agriculture'
  | 'Retail'
  | 'Transport'
  | 'Fashion'
  | 'Beauty & Cosmetics'
  | 'Construction'
  | 'Education'
  | 'Entertainment'
  | 'Hospitality'
  | 'Manufacturing'
  | 'Other';

export interface VerificationAsset {
  uri: string;
  fileName?: string;
  mimeType?: string;
  name?: string;
  type?: string;
}

export interface SignupVerificationResponse {
  email: string;
  verificationRequired: boolean;
  message?: string;
}

export interface ProfileUpdateInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  momoNumber?: string;
}

export interface Pitch {
  id: string;
  ownerId: string;
  ownerName: string;
  businessName: string;
  description: string;
  shortDescription: string;
  videoUrl?: string;
  imageUrl: string;
  monthlyIncome: number;
  amountNeeded: number;
  amountRaised: number;
  offerType: OfferType;
  offerValue: number;
  location: string;
  industry: Industry;
  status: PitchStatus;
  foundedYear: number;
  revenue: number;
  minimumInvestment: number;
  preMoneyValuation: number;
  campaignEndDate: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  pitchId: string;
  investorId: string;
  investorName: string;
  amount: number;
  returnType: ReturnType;
  returnValue: number;
  timelineMonths: number;
  status: BidStatus;
  note?: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  pitchId: string;
  bidId: string;
  businessName: string;
  ownerSigned: boolean;
  investorSigned: boolean;
  mfiApproved: boolean;
  paystackRef?: string;
  disbursedAt?: string;
  repaymentSchedule: Repayment[];
  status: DealStatus;
  amount: number;
  returnType: ReturnType;
  returnValue: number;
  timelineMonths: number;
  createdAt: string;
}

export interface Repayment {
  id: string;
  dealId: string;
  dueDate: string;
  amount: number;
  status: RepaymentStatus;
  momoRef?: string;
  collectedAt?: string;
}

export interface Investment {
  pitchId: string;
  businessName: string;
  industry: Industry;
  imageUrl: string;
  amount: number;
  currentValue: number;
  change: number;
  changePercent: number;
}

export interface ActivityItem {
  id: string;
  type: 'investment_completed' | 'business_update' | 'dividend_received';
  businessName: string;
  imageUrl: string;
  amount?: number;
  isCredit?: boolean;
  description: string;
  date: string;
  monthLabel?: string;
}
