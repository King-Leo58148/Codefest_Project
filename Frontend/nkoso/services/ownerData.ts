import type {
  Bid,
  BidStatus,
  Deal,
  DealStatus,
  Industry,
  OfferType,
  Pitch,
  PitchStatus,
  Repayment,
  RepaymentStatus,
  ReturnType,
} from '../types';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

type RequestFn = (path: string, options?: RequestOptions) => Promise<unknown>;

const OFFER_TYPES = ['EQUITY', 'REVENUE_SHARE', 'FIXED'] as const;
const BID_STATUSES = ['PENDING', 'COUNTERED', 'ACCEPTED', 'REJECTED'] as const;
const PITCH_STATUSES = ['PENDING', 'LIVE', 'FUNDED', 'EXPIRED', 'REJECTED'] as const;
const DEAL_STATUSES = [
  'PENDING_SIGNATURES',
  'PENDING_MFI',
  'MFI_APPROVED',
  'PAYMENT_PENDING',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'DEFAULTED',
  'FUNDED',
] as const;
const REPAYMENT_STATUSES = ['PENDING', 'COLLECTED', 'MISSED'] as const;

const INDUSTRY_LABELS: Record<string, Industry> = {
  TECHNOLOGY: 'Technology',
  FOOD_AND_BEVERAGE: 'Food & Bev',
  HEALTH: 'Health',
  AGRICULTURE: 'Agriculture',
  RETAIL: 'Retail',
  TRANSPORT: 'Transport',
  FASHION: 'Fashion',
  BEAUTY_AND_COSMETICS: 'Beauty & Cosmetics',
  CONSTRUCTION: 'Construction',
  EDUCATION: 'Education',
  ENTERTAINMENT: 'Entertainment',
  HOSPITALITY: 'Hospitality',
  MANUFACTURING: 'Manufacturing',
  OTHER: 'Other',
  SUSTAINABILITY: 'Sustainability',
  FITNESS: 'Fitness',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function readString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  return fallback;
}

function readOptionalString(value: unknown): string | undefined {
  const next = readString(value).trim();
  return next.length > 0 ? next : undefined;
}

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function readInteger(value: unknown, fallback = 0): number {
  return Math.trunc(readNumber(value, fallback));
}

function readBoolean(value: unknown): boolean {
  return Boolean(value);
}

function readId(value: unknown): string {
  return value == null ? '' : String(value);
}

function readDate(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return '';
}

function normalizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  const next = readString(value).toUpperCase() as T;
  return allowed.includes(next) ? next : fallback;
}

function toTitleCase(raw: string): Industry {
  return raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') as Industry;
}

function normalizeIndustry(value: unknown): Industry {
  const raw = readString(value).trim();

  if (!raw) {
    return 'Technology';
  }

  if (raw in INDUSTRY_LABELS) {
    return INDUSTRY_LABELS[raw];
  }

  return toTitleCase(raw);
}

export function normalizePitch(input: unknown): Pitch {
  const pitch = asRecord(input) ?? {};
  const owner = asRecord(pitch.owner);

  const description = readString(pitch.description);
  const shortDescription = readOptionalString(pitch.shortDescription) ?? description;

  return {
    id: readId(pitch.id),
    ownerId: readId(pitch.ownerId ?? owner?.id),
    ownerName: readString(pitch.ownerName ?? owner?.name),
    businessName: readString(pitch.businessName),
    description,
    shortDescription,
    videoUrl: readOptionalString(pitch.videoUrl),
    imageUrl: readString(pitch.imageUrl),
    monthlyIncome: readNumber(pitch.monthlyIncome),
    amountNeeded: readNumber(pitch.amountNeeded),
    amountRaised: readNumber(pitch.amountRaised),
    offerType: normalizeEnum<OfferType>(pitch.offerType, OFFER_TYPES, 'EQUITY'),
    offerValue: readNumber(pitch.offerValue),
    location: readString(pitch.location),
    industry: normalizeIndustry(pitch.industry),
    status: normalizeEnum<PitchStatus>(pitch.status, PITCH_STATUSES, 'PENDING'),
    foundedYear: readInteger(pitch.foundedYear),
    revenue: readNumber(pitch.revenue),
    minimumInvestment: readNumber(pitch.minimumInvestment),
    preMoneyValuation: readNumber(pitch.preMoneyValuation),
    campaignEndDate: readDate(pitch.campaignEndDate ?? pitch.expiresAt),
    createdAt: readDate(pitch.createdAt),
  };
}

export function normalizePitchList(input: unknown): Pitch[] {
  return Array.isArray(input) ? input.map(normalizePitch) : [];
}

export function normalizeBid(input: unknown): Bid {
  const bid = asRecord(input) ?? {};
  const investor = asRecord(bid.investor);
  const pitch = asRecord(bid.pitch);

  return {
    id: readId(bid.id),
    pitchId: readId(bid.pitchId ?? pitch?.id),
    investorId: readId(bid.investorId ?? investor?.id),
    investorName: readString(bid.investorName ?? investor?.name),
    amount: readNumber(bid.amount),
    returnType: normalizeEnum<ReturnType>(bid.returnType, OFFER_TYPES, 'EQUITY'),
    returnValue: readNumber(bid.returnValue),
    timelineMonths: readInteger(bid.timelineMonths),
    status: normalizeEnum<BidStatus>(bid.status, BID_STATUSES, 'PENDING'),
    note: readOptionalString(bid.note),
    createdAt: readDate(bid.createdAt),
  };
}

export function normalizeBidList(input: unknown): Bid[] {
  return Array.isArray(input) ? input.map(normalizeBid) : [];
}

export function dedupeBids(groups: ReadonlyArray<ReadonlyArray<Bid>>): Bid[] {
  const deduped = new Map<string, Bid>();

  for (const group of groups) {
    for (const bid of group) {
      if (!deduped.has(bid.id)) {
        deduped.set(bid.id, bid);
      }
    }
  }

  return Array.from(deduped.values());
}

export function normalizeRepayment(input: unknown): Repayment {
  const repayment = asRecord(input) ?? {};
  const deal = asRecord(repayment.deal);

  return {
    id: readId(repayment.id),
    dealId: readId(repayment.dealId ?? deal?.id),
    dueDate: readDate(repayment.dueDate),
    amount: readNumber(repayment.amount),
    status: normalizeEnum<RepaymentStatus>(repayment.status, REPAYMENT_STATUSES, 'PENDING'),
    momoRef: readOptionalString(repayment.momoRef),
    paystackRef: readOptionalString(repayment.paystackRef),
    collectedAt: readOptionalString(repayment.collectedAt),
    paidAt: readOptionalString(repayment.paidAt),
    transferredAt: readOptionalString(repayment.transferredAt),
  };
}

export function normalizeDeal(input: unknown): Deal {
  const deal = asRecord(input) ?? {};
  const pitch = asRecord(deal.pitch);
  const bid = asRecord(deal.bid);

  return {
    id: readId(deal.id),
    pitchId: readId(deal.pitchId ?? pitch?.id ?? asRecord(bid?.pitch)?.id),
    bidId: readId(deal.bidId ?? bid?.id),
    businessName: readString(deal.businessName ?? pitch?.businessName),
    ownerSigned: readBoolean(deal.ownerSigned),
    investorSigned: readBoolean(deal.investorSigned),
    mfiApproved: readBoolean(deal.mfiApproved),
    paystackRef: readOptionalString(deal.paystackRef),
    disbursedAt: readOptionalString(deal.disbursedAt),
    platformFee: readNumber(deal.platformFee),
    netDisbursementAmount: readNumber(deal.netDisbursementAmount),
    repaymentSchedule: Array.isArray(deal.repaymentSchedule)
      ? deal.repaymentSchedule.map(normalizeRepayment)
      : [],
    status: normalizeEnum<DealStatus>(deal.status, DEAL_STATUSES, 'PENDING_SIGNATURES'),
    amount: readNumber(deal.amount ?? bid?.amount),
    returnType: normalizeEnum<ReturnType>(deal.returnType ?? bid?.returnType, OFFER_TYPES, 'EQUITY'),
    returnValue: readNumber(deal.returnValue ?? bid?.returnValue),
    timelineMonths: readInteger(deal.timelineMonths ?? bid?.timelineMonths),
    createdAt: readDate(deal.createdAt),
  };
}

export function normalizeDealList(input: unknown): Deal[] {
  return Array.isArray(input) ? input.map(normalizeDeal) : [];
}

export function createOwnerDataApi(request: RequestFn) {
  const getMyPitches = async (): Promise<Pitch[]> => {
    const response = await request('/api/pitches/mine');
    return normalizePitchList(response);
  };

  const getBidsForPitch = async (pitchId: string): Promise<Bid[]> => {
    const response = await request(`/api/pitches/${pitchId}/bids`);
    return normalizeBidList(response);
  };

  const getOwnerBids = async (): Promise<Bid[]> => {
    const pitches = await getMyPitches();

    if (pitches.length === 0) {
      return [];
    }

    const settled = await Promise.allSettled(pitches.map((pitch) => getBidsForPitch(pitch.id)));
    const successful = settled
      .filter((result): result is PromiseFulfilledResult<Bid[]> => result.status === 'fulfilled')
      .map((result) => result.value);

    if (successful.length === 0) {
      throw settled[0]?.status === 'rejected'
        ? settled[0].reason
        : new Error('Failed to load owner bids.');
    }

    return dedupeBids(successful);
  };

  const getBid = async (id: string): Promise<Bid | undefined> => {
    const bids = await getOwnerBids();
    return bids.find((bid) => bid.id === id);
  };

  const getMyDeals = async (): Promise<Deal[]> => {
    const response = await request('/api/deals/mine');
    return normalizeDealList(response);
  };

  const getDeal = async (id: string): Promise<Deal | undefined> => {
    const response = await request(`/api/deals/${id}`);
    return response == null ? undefined : normalizeDeal(response);
  };

  return {
    normalizePitch,
    normalizePitchList,
    normalizeBid,
    normalizeBidList,
    normalizeRepayment,
    normalizeDeal,
    normalizeDealList,
    getMyPitches,
    getBidsForPitch,
    getOwnerBids,
    getBid,
    getMyDeals,
    getDeal,
  };
}
