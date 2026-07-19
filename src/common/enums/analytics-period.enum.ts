import type { ValueOf } from '@/common/types';

export const AnalyticsPeriod = {
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  HALF_YEAR: 'HALF_YEAR',
  YEAR: 'YEAR',
} as const;

export type AnalyticsPeriod = ValueOf<typeof AnalyticsPeriod>;
