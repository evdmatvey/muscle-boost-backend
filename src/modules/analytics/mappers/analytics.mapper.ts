import type { AnalyticsPeriod, MuscleGroup } from '@/common/enums';
import type { ExerciseProgressResponseDto } from '../dto/exercise-progress.response.dto';
import type { MuscleGroupVolumeResponseDto } from '../dto/muscle-group-volume.response.dto';
import type { SummaryResponseDto } from '../dto/summary.response.dto';
import { ANALYTICS_MUSCLE_GROUP_GRANULARITY } from '../enums/analytics-granularity.enum';
import type {
  ExerciseProgressPointRow,
  MuscleGroupVolumePointRow,
  SummaryTotalsRow,
  TopExerciseRow,
} from '../repositories/analytics.repository.interface';

export const toSummaryResponse = (params: {
  period: AnalyticsPeriod;
  dateFrom: Date;
  dateTo: Date;
  totals: SummaryTotalsRow;
  topExercises: TopExerciseRow[];
}): SummaryResponseDto => ({
  period: params.period,
  dateFrom: params.dateFrom.toISOString(),
  dateTo: params.dateTo.toISOString(),
  totals: {
    workoutsCount: params.totals.workoutsCount,
    setsCount: params.totals.setsCount,
    repsCount: params.totals.repsCount,
    volumeKg: params.totals.volumeKg,
  },
  topExercises: params.topExercises.map((item) => ({
    exerciseId: item.exerciseId,
    name: item.name,
    muscleGroup: item.muscleGroup,
    sessionsCount: item.sessionsCount,
  })),
});

export const toExerciseProgressResponse = (params: {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  period: AnalyticsPeriod;
  dateFrom: Date;
  dateTo: Date;
  points: ExerciseProgressPointRow[];
}): ExerciseProgressResponseDto => ({
  exerciseId: params.exerciseId,
  exerciseName: params.exerciseName,
  muscleGroup: params.muscleGroup,
  period: params.period,
  dateFrom: params.dateFrom.toISOString(),
  dateTo: params.dateTo.toISOString(),
  points: params.points.map((point) => ({
    date: point.date.toISOString(),
    maxWeightKg: point.maxWeightKg,
    totalReps: point.totalReps,
    volumeKg: point.volumeKg,
    setsCount: point.setsCount,
  })),
});

export const toMuscleGroupVolumeResponse = (params: {
  period: AnalyticsPeriod;
  dateFrom: Date;
  dateTo: Date;
  points: MuscleGroupVolumePointRow[];
}): MuscleGroupVolumeResponseDto => ({
  period: params.period,
  dateFrom: params.dateFrom.toISOString(),
  dateTo: params.dateTo.toISOString(),
  granularity: ANALYTICS_MUSCLE_GROUP_GRANULARITY,
  points: params.points.map((point) => ({
    periodStart: point.periodStart.toISOString(),
    muscleGroup: point.muscleGroup,
    volumeKg: point.volumeKg,
    setsCount: point.setsCount,
    exercisesCount: point.exercisesCount,
  })),
});
