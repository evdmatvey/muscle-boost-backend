import { Inject, Injectable } from '@nestjs/common';
import type { AnalyticsPeriod } from '@/common/enums';
import {
  ExerciseNotFoundException,
  ExercisesService,
} from '@/modules/exercises';
import type { ExerciseProgressResponseDto } from './dto/exercise-progress.response.dto';
import type { MuscleGroupVolumeResponseDto } from './dto/muscle-group-volume.response.dto';
import type { SummaryResponseDto } from './dto/summary.response.dto';
import {
  toExerciseProgressResponse,
  toMuscleGroupVolumeResponse,
  toSummaryResponse,
} from './mappers/analytics.mapper';
import {
  ANALYTICS_REPOSITORY,
  type IAnalyticsRepository,
} from './repositories/analytics.repository.interface';
import { resolvePeriodRange } from './utils/resolve-period-range.util';

const TOP_EXERCISES_LIMIT = 3;

@Injectable()
export class AnalyticsService {
  public constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly _analyticsRepository: IAnalyticsRepository,
    private readonly _exercisesService: ExercisesService,
  ) {}

  public async getSummary(
    userId: string,
    period: AnalyticsPeriod,
  ): Promise<SummaryResponseDto> {
    const { dateFrom, dateTo } = resolvePeriodRange(period);
    const range = { userId, dateFrom, dateTo };

    const [totals, topExercises] = await Promise.all([
      this._analyticsRepository.getSummaryTotals(range),
      this._analyticsRepository.getTopExercises(range, TOP_EXERCISES_LIMIT),
    ]);

    return toSummaryResponse({
      period,
      dateFrom,
      dateTo,
      totals,
      topExercises,
    });
  }

  public async getExerciseProgress(
    userId: string,
    period: AnalyticsPeriod,
    exerciseId: string,
  ): Promise<ExerciseProgressResponseDto> {
    const exercises = await this._exercisesService.findAccessibleByIds(userId, [
      exerciseId,
    ]);
    const exercise = exercises[0];

    if (exercise === undefined) {
      throw new ExerciseNotFoundException();
    }

    const { dateFrom, dateTo } = resolvePeriodRange(period);
    const points = await this._analyticsRepository.getExerciseProgressPoints(
      { userId, dateFrom, dateTo },
      exerciseId,
    );

    return toExerciseProgressResponse({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      period,
      dateFrom,
      dateTo,
      points,
    });
  }

  public async getMuscleGroupVolume(
    userId: string,
    period: AnalyticsPeriod,
  ): Promise<MuscleGroupVolumeResponseDto> {
    const { dateFrom, dateTo } = resolvePeriodRange(period);
    const points = await this._analyticsRepository.getMuscleGroupVolumePoints({
      userId,
      dateFrom,
      dateTo,
    });

    return toMuscleGroupVolumeResponse({
      period,
      dateFrom,
      dateTo,
      points,
    });
  }
}
