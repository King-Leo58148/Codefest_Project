export type PitchStatus = "active" | "draft" | "funded" | "closed";

export type BidStatus = "pending" | "accepted" | "declined";

export type DealStatus = "active" | "completed" | "pending_signature";

export interface BusinessPitch {
  id: string;
  title: string;
  fundingGoal: number;
  raised: number;
  bidCount: number;
  status: PitchStatus;
}

export interface InvestorBid {
  id: string;
  investorName: string;
  amount: number;
  pitchId: string;
  pitchTitle: string;
  message?: string;
  status: BidStatus;
  createdAt: string;
}

export interface BusinessDeal {
  id: string;
  investorName: string;
  pitchTitle: string;
  amount: number;
  status: DealStatus;
  startDate: string;
  expectedCloseDate?: string;
}

export interface DashboardStats {
  activePitches: number;
  newBids: number;
  totalRaised: number;
  activeDeals: number;
}

export interface PostPitchForm {
  title: string;
  description: string;
  fundingGoal: string;
  category: string;
  duration: string;
}
