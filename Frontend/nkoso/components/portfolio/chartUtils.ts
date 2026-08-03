import { Deal, Pitch } from '@/types';
import { ChartScope } from './ChartScopeToggle';

export interface ChartPoint {
  label: string;
  value: number;
  /** raw date string for tooltip / accessibility */
  date: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_ABBR   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── scope → bar-chart buckets ────────────────────────────────────────────────

/**
 * Returns the amount invested per time bucket for a given scope.
 * "value" is the SUM of deal.amount that falls into each bucket.
 */
export function buildBarChartData(
  deals: Deal[],
  scope: ChartScope,
  filterDealId?: string | null,    // investor: filter to single business
): ChartPoint[] {
  const now = new Date();
  const validDeals = deals.filter(d => {
    if (!d.createdAt) return false;
    if (filterDealId && d.id !== filterDealId) return false;
    return true;
  });

  if (scope === 'weekly') {
    // Last 7 days, one bucket per day (today + 6 previous)
    const buckets: ChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(new Date(now.getTime() - i * 86_400_000));
      const next = new Date(date.getTime() + 86_400_000);
      const value = validDeals
        .filter(d => {
          const t = new Date(d.createdAt).getTime();
          return t >= date.getTime() && t < next.getTime();
        })
        .reduce((sum, d) => sum + d.amount, 0);
      buckets.push({ label: DAY_ABBR[date.getDay()], value, date: date.toISOString() });
    }
    return buckets;
  }

  if (scope === 'monthly') {
    // Current calendar month, 4–5 weekly buckets
    const year  = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const buckets: ChartPoint[] = [];
    let cursor = firstDay;
    let weekNum = 1;
    while (cursor <= lastDay) {
      const weekStart = new Date(cursor);
      const weekEnd   = new Date(Math.min(cursor.getTime() + 6 * 86_400_000, lastDay.getTime()));
      const value = validDeals
        .filter(d => {
          const t = new Date(d.createdAt).getTime();
          return t >= weekStart.getTime() && t <= weekEnd.getTime() + 86_399_999;
        })
        .reduce((sum, d) => sum + d.amount, 0);
      buckets.push({ label: `W${weekNum}`, value, date: weekStart.toISOString() });
      cursor = new Date(weekEnd.getTime() + 86_400_000);
      weekNum++;
    }
    return buckets;
  }

  // yearly — one bucket per month (Jan–Dec of current year)
  const year = now.getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(year, i, 1).getTime();
    const monthEnd   = new Date(year, i + 1, 0).getTime() + 86_399_999;
    const value = validDeals
      .filter(d => {
        const t = new Date(d.createdAt).getTime();
        return t >= monthStart && t <= monthEnd;
      })
      .reduce((sum, d) => sum + d.amount, 0);
    return { label: MONTH_ABBR[i], value, date: new Date(year, i, 1).toISOString() };
  });
}

// ─── timeline (cumulative) ────────────────────────────────────────────────────

export type TimelineMode = 'first-deal' | 'this-year';

/**
 * Returns cumulative portfolio value over time.
 * Each point represents the total invested up to that date.
 */
export function buildTimelineData(
  deals: Deal[],
  mode: TimelineMode,
): ChartPoint[] {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // Valid deals with parseable dates, sorted oldest first
  const sorted = deals
    .filter(d => !!d.createdAt && !!d.amount)
    .map(d => ({ ...d, ts: new Date(d.createdAt).getTime() }))
    .sort((a, b) => a.ts - b.ts);

  if (sorted.length === 0) return [];

  const startTs = mode === 'this-year'
    ? yearStart.getTime()
    : sorted[0].ts;

  // Generate monthly checkpoints from start → now
  const startDate = new Date(startTs);
  const points: ChartPoint[] = [];
  let cumulative = 0;

  // Deals before the window start still count as baseline
  if (mode === 'this-year') {
    cumulative = sorted
      .filter(d => d.ts < yearStart.getTime())
      .reduce((sum, d) => sum + d.amount, 0);
  }

  // Walk month-by-month
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  while (cursor < endMonth) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getTime() + 86_399_999;
    const monthStart = cursor.getTime();

    const monthTotal = sorted
      .filter(d => d.ts >= monthStart && d.ts <= monthEnd)
      .reduce((sum, d) => sum + d.amount, 0);

    cumulative += monthTotal;

    const label = `${MONTH_ABBR[cursor.getMonth()]}${cursor.getFullYear() !== now.getFullYear() ? ` '${String(cursor.getFullYear()).slice(2)}` : ''}`;
    points.push({ label, value: cumulative, date: cursor.toISOString() });

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return points;
}

// ─── owner-side: capital raised per month ────────────────────────────────────

/**
 * For the owner, we track amountRaised on each pitch over time.
 * Since pitches don't have per-transaction timestamps, we treat each
 * pitch's createdAt as the moment its raised amount was recorded.
 * This gives a reasonable approximation; replace with repayment data when available.
 */
export function buildOwnerBarChartData(
  pitches: Pitch[],
  scope: ChartScope,
  filterPitchId?: string | null,
): ChartPoint[] {
  const now = new Date();
  const validPitches = pitches.filter(p => {
    if (!p.createdAt) return false;
    if (filterPitchId && p.id !== filterPitchId) return false;
    return true;
  });

  if (scope === 'weekly') {
    const buckets: ChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(new Date(now.getTime() - i * 86_400_000));
      const next = new Date(date.getTime() + 86_400_000);
      const value = validPitches
        .filter(p => {
          const t = new Date(p.createdAt).getTime();
          return t >= date.getTime() && t < next.getTime();
        })
        .reduce((sum, p) => sum + p.amountRaised, 0);
      buckets.push({ label: DAY_ABBR[date.getDay()], value, date: date.toISOString() });
    }
    return buckets;
  }

  if (scope === 'monthly') {
    const year  = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const buckets: ChartPoint[] = [];
    let cursor = firstDay;
    let weekNum = 1;
    while (cursor <= lastDay) {
      const weekStart = new Date(cursor);
      const weekEnd   = new Date(Math.min(cursor.getTime() + 6 * 86_400_000, lastDay.getTime()));
      const value = validPitches
        .filter(p => {
          const t = new Date(p.createdAt).getTime();
          return t >= weekStart.getTime() && t <= weekEnd.getTime() + 86_399_999;
        })
        .reduce((sum, p) => sum + p.amountRaised, 0);
      buckets.push({ label: `W${weekNum}`, value, date: weekStart.toISOString() });
      cursor = new Date(weekEnd.getTime() + 86_400_000);
      weekNum++;
    }
    return buckets;
  }

  const year = now.getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(year, i, 1).getTime();
    const monthEnd   = new Date(year, i + 1, 0).getTime() + 86_399_999;
    const value = validPitches
      .filter(p => {
        const t = new Date(p.createdAt).getTime();
        return t >= monthStart && t <= monthEnd;
      })
      .reduce((sum, p) => sum + p.amountRaised, 0);
    return { label: MONTH_ABBR[i], value, date: new Date(year, i, 1).toISOString() };
  });
}

export function buildOwnerTimelineData(
  pitches: Pitch[],
  mode: TimelineMode,
): ChartPoint[] {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const sorted = pitches
    .filter(p => !!p.createdAt && p.amountRaised > 0)
    .map(p => ({ ...p, ts: new Date(p.createdAt).getTime() }))
    .sort((a, b) => a.ts - b.ts);

  if (sorted.length === 0) return [];

  const startTs = mode === 'this-year' ? yearStart.getTime() : sorted[0].ts;
  let cumulative = mode === 'this-year'
    ? sorted.filter(p => p.ts < yearStart.getTime()).reduce((s, p) => s + p.amountRaised, 0)
    : 0;

  const startDate = new Date(startTs);
  const points: ChartPoint[] = [];
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  while (cursor < endMonth) {
    const monthEnd   = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getTime() + 86_399_999;
    const monthStart = cursor.getTime();
    const monthTotal = sorted
      .filter(p => p.ts >= monthStart && p.ts <= monthEnd)
      .reduce((s, p) => s + p.amountRaised, 0);
    cumulative += monthTotal;
    const label = `${MONTH_ABBR[cursor.getMonth()]}${cursor.getFullYear() !== now.getFullYear() ? ` '${String(cursor.getFullYear()).slice(2)}` : ''}`;
    points.push({ label, value: cumulative, date: cursor.toISOString() });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return points;
}

// ─── format helpers ───────────────────────────────────────────────────────────

export function formatChartCurrency(n: number): string {
  if (n >= 1_000_000) return `GH₵${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `GH₵${(n / 1_000).toFixed(1)}k`;
  return `GH₵${n.toLocaleString()}`;
}
