import { describe, expect, it } from '@jest/globals';
import { AnalyticsPeriod } from '@/common/enums';
import { resolvePeriodRange } from '../utils/resolve-period-range.util';

describe('resolvePeriodRange', () => {
  const now = new Date('2026-07-19T12:00:00.000Z');

  it('resolves WEEK as 7 days back', () => {
    const { dateFrom, dateTo } = resolvePeriodRange(AnalyticsPeriod.WEEK, now);

    expect(dateTo.toISOString()).toBe('2026-07-19T12:00:00.000Z');
    expect(dateFrom.toISOString()).toBe('2026-07-12T12:00:00.000Z');
  });

  it('resolves MONTH as one calendar month back', () => {
    const { dateFrom, dateTo } = resolvePeriodRange(AnalyticsPeriod.MONTH, now);

    expect(dateTo.toISOString()).toBe('2026-07-19T12:00:00.000Z');
    expect(dateFrom.toISOString()).toBe('2026-06-19T12:00:00.000Z');
  });

  it('resolves HALF_YEAR as six calendar months back', () => {
    const { dateFrom, dateTo } = resolvePeriodRange(
      AnalyticsPeriod.HALF_YEAR,
      now,
    );

    expect(dateTo.toISOString()).toBe('2026-07-19T12:00:00.000Z');
    expect(dateFrom.toISOString()).toBe('2026-01-19T12:00:00.000Z');
  });

  it('resolves YEAR as one calendar year back', () => {
    const { dateFrom, dateTo } = resolvePeriodRange(AnalyticsPeriod.YEAR, now);

    expect(dateTo.toISOString()).toBe('2026-07-19T12:00:00.000Z');
    expect(dateFrom.toISOString()).toBe('2025-07-19T12:00:00.000Z');
  });
});
