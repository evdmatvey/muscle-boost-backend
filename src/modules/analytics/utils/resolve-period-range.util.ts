import { AnalyticsPeriod } from '@/common/enums';

export type PeriodRange = {
  dateFrom: Date;
  dateTo: Date;
};

export const resolvePeriodRange = (
  period: AnalyticsPeriod,
  now: Date = new Date(),
): PeriodRange => {
  const dateTo = new Date(now.getTime());
  const dateFrom = new Date(now.getTime());

  switch (period) {
    case AnalyticsPeriod.WEEK:
      dateFrom.setUTCDate(dateFrom.getUTCDate() - 7);
      break;
    case AnalyticsPeriod.MONTH:
      dateFrom.setUTCMonth(dateFrom.getUTCMonth() - 1);
      break;
    case AnalyticsPeriod.HALF_YEAR:
      dateFrom.setUTCMonth(dateFrom.getUTCMonth() - 6);
      break;
    case AnalyticsPeriod.YEAR:
      dateFrom.setUTCFullYear(dateFrom.getUTCFullYear() - 1);
      break;
  }

  return { dateFrom, dateTo };
};
