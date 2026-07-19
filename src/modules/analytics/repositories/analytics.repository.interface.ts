import type { MuscleGroup } from '@/common/enums';

export type AnalyticsDateRange = {
  userId: string;
  dateFrom: Date;
  dateTo: Date;
};

export type SummaryTotalsRow = {
  workoutsCount: number;
  setsCount: number;
  repsCount: number;
  volumeKg: number;
};

export type TopExerciseRow = {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sessionsCount: number;
};

export type ExerciseProgressPointRow = {
  date: Date;
  maxWeightKg: number;
  totalReps: number;
  volumeKg: number;
  setsCount: number;
};

export type MuscleGroupVolumePointRow = {
  periodStart: Date;
  muscleGroup: MuscleGroup;
  volumeKg: number;
  setsCount: number;
  exercisesCount: number;
};

export interface IAnalyticsRepository {
  getSummaryTotals(range: AnalyticsDateRange): Promise<SummaryTotalsRow>;
  getTopExercises(
    range: AnalyticsDateRange,
    limit: number,
  ): Promise<TopExerciseRow[]>;
  getExerciseProgressPoints(
    range: AnalyticsDateRange,
    exerciseId: string,
  ): Promise<ExerciseProgressPointRow[]>;
  getMuscleGroupVolumePoints(
    range: AnalyticsDateRange,
  ): Promise<MuscleGroupVolumePointRow[]>;
}

export const ANALYTICS_REPOSITORY = Symbol('ANALYTICS_REPOSITORY');
