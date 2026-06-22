import type { BidStatus, DealStatus, PitchStatus } from "./types";

export const BUSINESS_COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#F3F4F6",
  text: "#1E1B4B",
  muted: "#6B7280",
} as const;

export const STATUS_LABELS: Record<PitchStatus, string> = {
  active: "Active",
  draft: "Draft",
  funded: "Funded",
  closed: "Closed",
};

export const STATUS_COLORS: Record<PitchStatus, string> = {
  active: "#10B981",
  draft: "#6B7280",
  funded: "#4F46E5",
  closed: "#EF4444",
};

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
};

export const BID_STATUS_COLORS: Record<BidStatus, string> = {
  pending: "#F59E0B",
  accepted: "#10B981",
  declined: "#EF4444",
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  active: "Active",
  completed: "Completed",
  pending_signature: "Pending Signature",
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  active: "#0EA5E9",
  completed: "#10B981",
  pending_signature: "#F59E0B",
};

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }

  return `$${amount.toLocaleString()}`;
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString();
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
