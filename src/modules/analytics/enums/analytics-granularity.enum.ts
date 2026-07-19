import type { ValueOf } from '@/common/types';

export const AnalyticsGranularity = {
  WEEK: 'WEEK',
} as const;

export type AnalyticsGranularity = ValueOf<typeof AnalyticsGranularity>;

export const ANALYTICS_MUSCLE_GROUP_GRANULARITY = AnalyticsGranularity.WEEK;

const GRANULARITY_DATE_TRUNC: Record<AnalyticsGranularity, string> = {
  [AnalyticsGranularity.WEEK]: 'week',
};

export const toDateTruncUnit = (granularity: AnalyticsGranularity): string =>
  GRANULARITY_DATE_TRUNC[granularity];
