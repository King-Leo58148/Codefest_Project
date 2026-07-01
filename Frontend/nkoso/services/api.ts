import { Pitch, Bid, Deal, User, Industry, BidStatus } from '@/types';
import {
  MOCK_PITCHES,
  MOCK_BIDS,
  MOCK_DEALS,
  MOCK_INVESTMENTS,
  MOCK_ACTIVITY,
  MOCK_INVESTOR,
  MOCK_OWNER,
} from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Auth
export async function loginUser(email: string, _password: string): Promise<User> {
  await delay(800);
  if (email.includes('owner')) return MOCK_OWNER;
  return MOCK_INVESTOR;
}

export async function registerUser(
  name: string,
  email: string,
  _password: string,
  role: 'INVESTOR' | 'OWNER'
): Promise<User> {
  await delay(1000);
  return {
    id: 'new-user',
    name,
    email,
    role,
    isVerified: false,
    ghanaCardVerified: false,
    momoVerified: false,
  };
}

export async function verifyGhanaCard(_ghanaCardNumber: string): Promise<boolean> {
  await delay(1500);
  return true;
}

export async function verifyMomo(_momoNumber: string): Promise<boolean> {
  await delay(1200);
  return true;
}

// Pitches
export async function getPitches(industry?: Industry): Promise<Pitch[]> {
  await delay(600);
  if (!industry || industry === 'All') return MOCK_PITCHES;
  return MOCK_PITCHES.filter((p) => p.industry === industry);
}

export async function getPitch(id: string): Promise<Pitch | undefined> {
  await delay(400);
  return MOCK_PITCHES.find((p) => p.id === id);
}

export async function createPitch(data: Partial<Pitch>): Promise<Pitch> {
  await delay(1000);
  return {
    id: 'new-pitch',
    ownerId: 'u3',
    ownerName: 'Abena Mensah',
    businessName: data.businessName || '',
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    monthlyIncome: data.monthlyIncome || 0,
    amountNeeded: data.amountNeeded || 0,
    amountRaised: 0,
    offerType: data.offerType || 'EQUITY',
    offerValue: data.offerValue || 0,
    location: data.location || '',
    industry: data.industry || 'Retail',
    status: 'PENDING',
    foundedYear: 2024,
    revenue: 0,
    minimumInvestment: 100,
    preMoneyValuation: 0,
    campaignEndDate: '2024-12-31',
    createdAt: new Date().toISOString(),
    ...data,
  };
}

// Bids
export async function getBidsForPitch(pitchId: string): Promise<Bid[]> {
  await delay(500);
  return MOCK_BIDS.filter((b) => b.pitchId === pitchId);
}

export async function getMyBids(investorId: string): Promise<Bid[]> {
  await delay(500);
  return MOCK_BIDS.filter((b) => b.investorId === investorId);
}

export async function placeBid(bid: Partial<Bid>): Promise<Bid> {
  await delay(800);
  return {
    id: 'new-bid',
    pitchId: bid.pitchId || '',
    investorId: 'u1',
    investorName: 'Alex Smith',
    amount: bid.amount || 0,
    returnType: bid.returnType || 'EQUITY',
    returnValue: bid.returnValue || 0,
    timelineMonths: bid.timelineMonths || 12,
    status: 'PENDING',
    note: bid.note,
    createdAt: new Date().toISOString(),
  };
}

export async function updateBidStatus(bidId: string, status: BidStatus): Promise<Bid> {
  await delay(600);
  const bid = MOCK_BIDS.find((b) => b.id === bidId);
  return { ...bid!, status };
}

// Investments / Portfolio
export async function getMyInvestments() {
  await delay(400);
  return MOCK_INVESTMENTS;
}

// Activity
export async function getActivity() {
  await delay(400);
  return MOCK_ACTIVITY;
}

// Deals
export async function getDeal(id: string): Promise<Deal | undefined> {
  await delay(400);
  return MOCK_DEALS.find((d) => d.id === id);
}

export async function signDeal(dealId: string, _role: 'owner' | 'investor'): Promise<Deal> {
  await delay(800);
  const deal = MOCK_DEALS.find((d) => d.id === dealId);
  return { ...deal!, investorSigned: true };
}

export async function initiatePayment(dealId: string): Promise<{ paystackUrl: string }> {
  await delay(1000);
  return { paystackUrl: 'https://paystack.com/pay/mock-ref' };
}
