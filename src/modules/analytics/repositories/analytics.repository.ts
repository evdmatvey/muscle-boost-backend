import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type MuscleGroup, SessionStatus } from '@/common/enums';
import { WorkoutSession } from '@/modules/workout-sessions';
import {
  ANALYTICS_MUSCLE_GROUP_GRANULARITY,
  toDateTruncUnit,
} from '../enums/analytics-granularity.enum';
import type {
  AnalyticsDateRange,
  ExerciseProgressPointRow,
  IAnalyticsRepository,
  MuscleGroupVolumePointRow,
  SummaryTotalsRow,
  TopExerciseRow,
} from './analytics.repository.interface';

type SummaryTotalsRaw = {
  workoutsCount: string | number | null;
  setsCount: string | number | null;
  repsCount: string | number | null;
  volumeKg: string | number | null;
};

type TopExerciseRaw = {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sessionsCount: string | number;
};

type ExerciseProgressRaw = {
  date: Date | string;
  maxWeightKg: string | number;
  totalReps: string | number;
  volumeKg: string | number;
  setsCount: string | number;
};

type MuscleGroupVolumeRaw = {
  periodStart: Date | string;
  muscleGroup: MuscleGroup;
  volumeKg: string | number;
  setsCount: string | number;
  exercisesCount: string | number;
};

const VOLUME_SUM_SQL = 'COALESCE(SUM(sl.actualWeightKg * sl.actualReps), 0)';

@Injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  public constructor(
    @InjectRepository(WorkoutSession)
    private readonly _sessionsRepository: Repository<WorkoutSession>,
  ) {}

  public async getSummaryTotals(
    range: AnalyticsDateRange,
  ): Promise<SummaryTotalsRow> {
    const workoutsCount = await this._sessionsRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId: range.userId })
      .andWhere('session.status = :status', {
        status: SessionStatus.COMPLETED,
      })
      .andWhere('session.startedAt >= :dateFrom', { dateFrom: range.dateFrom })
      .andWhere('session.startedAt <= :dateTo', { dateTo: range.dateTo })
      .getCount();

    const raw = await this._workingSetsQuery(range)
      .select('COUNT(sl.id)', 'setsCount')
      .addSelect('COALESCE(SUM(sl.actualReps), 0)', 'repsCount')
      .addSelect(VOLUME_SUM_SQL, 'volumeKg')
      .getRawOne<SummaryTotalsRaw>();

    return {
      workoutsCount,
      setsCount: Number(raw?.setsCount ?? 0),
      repsCount: Number(raw?.repsCount ?? 0),
      volumeKg: Number(raw?.volumeKg ?? 0),
    };
  }

  public async getTopExercises(
    range: AnalyticsDateRange,
    limit: number,
  ): Promise<TopExerciseRow[]> {
    const rows = await this._workingSetsQuery(range)
      .innerJoin('se.exercise', 'exercise')
      .select('se.exerciseId', 'exerciseId')
      .addSelect('exercise.name', 'name')
      .addSelect('exercise.muscleGroup', 'muscleGroup')
      .addSelect('COUNT(DISTINCT session.id)', 'sessionsCount')
      .groupBy('se.exerciseId')
      .addGroupBy('exercise.name')
      .addGroupBy('exercise.muscleGroup')
      .orderBy('COUNT(DISTINCT session.id)', 'DESC')
      .addOrderBy('exercise.name', 'ASC')
      .limit(limit)
      .getRawMany<TopExerciseRaw>();

    return rows.map((row) => ({
      exerciseId: row.exerciseId,
      name: row.name,
      muscleGroup: row.muscleGroup,
      sessionsCount: Number(row.sessionsCount),
    }));
  }

  public async getExerciseProgressPoints(
    range: AnalyticsDateRange,
    exerciseId: string,
  ): Promise<ExerciseProgressPointRow[]> {
    const rows = await this._workingSetsQuery(range)
      .andWhere('se.exerciseId = :exerciseId', { exerciseId })
      .select("DATE_TRUNC('day', session.startedAt)", 'date')
      .addSelect('MAX(sl.actualWeightKg)', 'maxWeightKg')
      .addSelect('COALESCE(SUM(sl.actualReps), 0)', 'totalReps')
      .addSelect(VOLUME_SUM_SQL, 'volumeKg')
      .addSelect('COUNT(sl.id)', 'setsCount')
      .groupBy("DATE_TRUNC('day', session.startedAt)")
      .orderBy("DATE_TRUNC('day', session.startedAt)", 'ASC')
      .getRawMany<ExerciseProgressRaw>();

    return rows.map((row) => ({
      date: new Date(row.date),
      maxWeightKg: Number(row.maxWeightKg),
      totalReps: Number(row.totalReps),
      volumeKg: Number(row.volumeKg),
      setsCount: Number(row.setsCount),
    }));
  }

  public async getMuscleGroupVolumePoints(
    range: AnalyticsDateRange,
  ): Promise<MuscleGroupVolumePointRow[]> {
    const truncUnit = toDateTruncUnit(ANALYTICS_MUSCLE_GROUP_GRANULARITY);
    const periodBucketSql = `DATE_TRUNC('${truncUnit}', session.startedAt)`;

    const rows = await this._workingSetsQuery(range)
      .innerJoin('se.exercise', 'exercise')
      .select(periodBucketSql, 'periodStart')
      .addSelect('exercise.muscleGroup', 'muscleGroup')
      .addSelect(VOLUME_SUM_SQL, 'volumeKg')
      .addSelect('COUNT(sl.id)', 'setsCount')
      .addSelect('COUNT(DISTINCT se.exerciseId)', 'exercisesCount')
      .groupBy(periodBucketSql)
      .addGroupBy('exercise.muscleGroup')
      .orderBy(periodBucketSql, 'ASC')
      .addOrderBy('exercise.muscleGroup', 'ASC')
      .getRawMany<MuscleGroupVolumeRaw>();

    return rows.map((row) => ({
      periodStart: new Date(row.periodStart),
      muscleGroup: row.muscleGroup,
      volumeKg: Number(row.volumeKg),
      setsCount: Number(row.setsCount),
      exercisesCount: Number(row.exercisesCount),
    }));
  }

  private _completedSessionsQuery(range: AnalyticsDateRange) {
    return this._sessionsRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId: range.userId })
      .andWhere('session.status = :status', {
        status: SessionStatus.COMPLETED,
      })
      .andWhere('session.startedAt >= :dateFrom', { dateFrom: range.dateFrom })
      .andWhere('session.startedAt <= :dateTo', { dateTo: range.dateTo });
  }

  private _workingSetsQuery(range: AnalyticsDateRange) {
    return this._completedSessionsQuery(range)
      .innerJoin('session.sessionExercises', 'se')
      .innerJoin('se.setLogs', 'sl')
      .andWhere('se.isSkipped = false')
      .andWhere('sl.isWarmup = false')
      .andWhere('sl.actualReps IS NOT NULL')
      .andWhere('sl.actualWeightKg IS NOT NULL');
  }
}
