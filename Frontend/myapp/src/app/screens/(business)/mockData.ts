import type { BusinessDeal, BusinessPitch, DashboardStats, InvestorBid } from "./types";

export const MOCK_BUSINESS_NAME = "EcoTech Solutions";

export const MOCK_STATS: DashboardStats = {
  activePitches: 2,
  newBids: 3,
  totalRaised: 125000,
  activeDeals: 1,
};

export const MOCK_PITCHES: BusinessPitch[] = [
  {
    id: "1",
    title: "Series A Expansion",
    fundingGoal: 500000,
    raised: 125000,
    bidCount: 3,
    status: "active",
  },
  {
    id: "2",
    title: "Product Launch Fund",
    fundingGoal: 150000,
    raised: 42000,
    bidCount: 2,
    status: "active",
  },
];

export const MOCK_BIDS: InvestorBid[] = [
  {
    id: "1",
    investorName: "Sarah Chen",
    amount: 50000,
    pitchId: "1",
    pitchTitle: "Series A Expansion",
    message: "Strong team and clear growth plan. Happy to lead this round.",
    status: "pending",
    createdAt: "2026-06-20T10:30:00Z",
  },
  {
    id: "2",
    investorName: "Venture Capital Partners",
    amount: 75000,
    pitchId: "1",
    pitchTitle: "Series A Expansion",
    message: "Interested in your sustainability metrics and market traction.",
    status: "pending",
    createdAt: "2026-06-19T15:45:00Z",
  },
  {
    id: "3",
    investorName: "James Okonkwo",
    amount: 25000,
    pitchId: "2",
    pitchTitle: "Product Launch Fund",
    status: "pending",
    createdAt: "2026-06-18T09:15:00Z",
  },
  {
    id: "4",
    investorName: "Green Future Fund",
    amount: 40000,
    pitchId: "2",
    pitchTitle: "Product Launch Fund",
    message: "Aligned with our cleantech portfolio thesis.",
    status: "accepted",
    createdAt: "2026-06-10T14:00:00Z",
  },
  {
    id: "5",
    investorName: "Atlas Angels",
    amount: 30000,
    pitchId: "1",
    pitchTitle: "Series A Expansion",
    status: "declined",
    createdAt: "2026-06-05T11:20:00Z",
  },
];

export const MOCK_DEALS: BusinessDeal[] = [
  {
    id: "1",
    investorName: "Green Future Fund",
    pitchTitle: "Product Launch Fund",
    amount: 40000,
    status: "active",
    startDate: "2026-06-12T00:00:00Z",
    expectedCloseDate: "2026-09-12T00:00:00Z",
  },
  {
    id: "2",
    investorName: "Horizon Ventures",
    pitchTitle: "Seed Round 2025",
    amount: 85000,
    status: "completed",
    startDate: "2025-11-01T00:00:00Z",
    expectedCloseDate: "2026-02-01T00:00:00Z",
  },
  {
    id: "3",
    investorName: "Sarah Chen",
    pitchTitle: "Series A Expansion",
    amount: 50000,
    status: "pending_signature",
    startDate: "2026-06-21T00:00:00Z",
    expectedCloseDate: "2026-09-21T00:00:00Z",
  },
];

export const PITCH_CATEGORIES = [
  { label: "Technology", value: "technology" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Clean Energy", value: "clean_energy" },
  { label: "Consumer", value: "consumer" },
  { label: "Fintech", value: "fintech" },
  { label: "Other", value: "other" },
];

export const PITCH_DURATIONS = [
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
  { label: "120 days", value: "120" },
];
