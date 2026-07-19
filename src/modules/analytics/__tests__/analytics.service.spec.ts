import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AnalyticsPeriod, MuscleGroup } from '@/common/enums';
import {
  type Exercise,
  ExerciseNotFoundException,
  ExercisesService,
} from '@/modules/exercises';
import { AnalyticsService } from '../analytics.service';
import { ANALYTICS_MUSCLE_GROUP_GRANULARITY } from '../enums/analytics-granularity.enum';
import {
  ANALYTICS_REPOSITORY,
  type IAnalyticsRepository,
} from '../repositories/analytics.repository.interface';

const createExerciseFixture = (
  overrides: Partial<Exercise> = {},
): Exercise => ({
  id: 'exercise-id',
  name: 'Жим штанги лёжа',
  description: 'Описание',
  muscleGroup: MuscleGroup.CHEST,
  userId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let analyticsRepository: jest.Mocked<IAnalyticsRepository>;
  let exercisesService: {
    findAccessibleByIds: jest.MockedFunction<
      ExercisesService['findAccessibleByIds']
    >;
  };

  beforeEach(async () => {
    analyticsRepository = {
      getSummaryTotals: jest.fn(),
      getTopExercises: jest.fn(),
      getExerciseProgressPoints: jest.fn(),
      getMuscleGroupVolumePoints: jest.fn(),
    };

    exercisesService = {
      findAccessibleByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: ANALYTICS_REPOSITORY,
          useValue: analyticsRepository,
        },
        {
          provide: ExercisesService,
          useValue: exercisesService,
        },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  describe('getSummary', () => {
    it('returns totals and top exercises for period', async () => {
      analyticsRepository.getSummaryTotals.mockResolvedValue({
        workoutsCount: 5,
        setsCount: 40,
        repsCount: 400,
        volumeKg: 12000,
      });
      analyticsRepository.getTopExercises.mockResolvedValue([
        {
          exerciseId: 'exercise-id',
          name: 'Жим штанги лёжа',
          muscleGroup: MuscleGroup.CHEST,
          sessionsCount: 4,
        },
      ]);

      const result = await service.getSummary('user-id', AnalyticsPeriod.MONTH);

      expect(result.period).toBe(AnalyticsPeriod.MONTH);
      expect(result.totals).toEqual({
        workoutsCount: 5,
        setsCount: 40,
        repsCount: 400,
        volumeKg: 12000,
      });
      expect(result.topExercises).toHaveLength(1);
      expect(analyticsRepository.getTopExercises.mock.calls).toEqual([
        [expect.objectContaining({ userId: 'user-id' }), 3],
      ]);
    });
  });

  describe('getExerciseProgress', () => {
    it('returns progress points for accessible exercise', async () => {
      exercisesService.findAccessibleByIds.mockResolvedValue([
        createExerciseFixture(),
      ]);
      analyticsRepository.getExerciseProgressPoints.mockResolvedValue([
        {
          date: new Date('2026-07-10T00:00:00.000Z'),
          maxWeightKg: 80,
          totalReps: 30,
          volumeKg: 2400,
          setsCount: 3,
        },
      ]);

      const result = await service.getExerciseProgress(
        'user-id',
        AnalyticsPeriod.WEEK,
        'exercise-id',
      );

      expect(result.exerciseId).toBe('exercise-id');
      expect(result.exerciseName).toBe('Жим штанги лёжа');
      expect(result.muscleGroup).toBe(MuscleGroup.CHEST);
      expect(result.points).toEqual([
        {
          date: '2026-07-10T00:00:00.000Z',
          maxWeightKg: 80,
          totalReps: 30,
          volumeKg: 2400,
          setsCount: 3,
        },
      ]);
    });

    it('propagates exercise not found from exercises module', async () => {
      exercisesService.findAccessibleByIds.mockRejectedValue(
        new ExerciseNotFoundException(),
      );

      await expect(
        service.getExerciseProgress(
          'user-id',
          AnalyticsPeriod.WEEK,
          'missing-id',
        ),
      ).rejects.toBeInstanceOf(ExerciseNotFoundException);
    });
  });

  describe('getMuscleGroupVolume', () => {
    it('returns weekly muscle group points', async () => {
      analyticsRepository.getMuscleGroupVolumePoints.mockResolvedValue([
        {
          periodStart: new Date('2026-07-13T00:00:00.000Z'),
          muscleGroup: MuscleGroup.CHEST,
          volumeKg: 5000,
          setsCount: 12,
          exercisesCount: 2,
        },
      ]);

      const result = await service.getMuscleGroupVolume(
        'user-id',
        AnalyticsPeriod.MONTH,
      );

      expect(result.granularity).toBe(ANALYTICS_MUSCLE_GROUP_GRANULARITY);
      expect(result.points).toEqual([
        {
          periodStart: '2026-07-13T00:00:00.000Z',
          muscleGroup: MuscleGroup.CHEST,
          volumeKg: 5000,
          setsCount: 12,
          exercisesCount: 2,
        },
      ]);
    });
  });
});
