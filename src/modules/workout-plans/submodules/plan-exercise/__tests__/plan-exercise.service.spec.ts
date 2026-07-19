import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MuscleGroup, WorkoutType } from '@/common/enums';
import {
  type Exercise,
  ExerciseNotFoundException,
  ExercisesService,
} from '@/modules/exercises';
import type { WorkoutPlan } from '../../../entities/workout-plan.entity';
import { DuplicateOrderIndexException } from '../../../exceptions/duplicate-order-index.exception';
import { ExerciseNotAccessibleException } from '../../../exceptions/exercise-not-accessible.exception';
import { PlanExerciseNotFoundException } from '../../../exceptions/plan-exercise-not-found.exception';
import {
  type IWorkoutPlanContext,
  WORKOUT_PLAN_CONTEXT,
} from '../../../interfaces/workout-plan-context.interface';
import type { PlanExercise } from '../entities/plan-exercise.entity';
import { PlanExerciseService } from '../plan-exercise.service';
import {
  type IPlanExercisesRepository,
  PLAN_EXERCISES_REPOSITORY,
} from '../repositories/plan-exercises.repository.interface';

const createPlanFixture = (
  overrides: Partial<WorkoutPlan> = {},
): WorkoutPlan => ({
  id: 'plan-id',
  userId: 'user-id',
  name: 'Push Day',
  notes: null,
  workoutType: WorkoutType.CHEST,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

const createExerciseFixture = (
  overrides: Partial<Exercise> = {},
): Exercise => ({
  id: 'exercise-id',
  name: 'Жим',
  description: 'Описание',
  muscleGroup: MuscleGroup.CHEST,
  userId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

const createPlanExerciseFixture = (
  overrides: Partial<PlanExercise> = {},
): PlanExercise => ({
  id: 'plan-exercise-id',
  planId: 'plan-id',
  exerciseId: 'exercise-id',
  orderIndex: 0,
  notes: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  exercise: createExerciseFixture(),
  planSets: [],
  ...overrides,
});

describe('PlanExerciseService', () => {
  let service: PlanExerciseService;
  let planExercisesRepository: jest.Mocked<
    Pick<
      IPlanExercisesRepository,
      | 'existsOrderIndex'
      | 'createWithSets'
      | 'findOwnedById'
      | 'softDeleteWithSets'
    >
  >;
  let getOwnedPlan: jest.MockedFunction<IWorkoutPlanContext['getOwnedPlan']>;
  let recomputeWorkoutType: jest.MockedFunction<
    IWorkoutPlanContext['recomputeWorkoutType']
  >;
  let exercisesService: jest.Mocked<
    Pick<ExercisesService, 'findAccessibleByIds'>
  >;

  beforeEach(async () => {
    planExercisesRepository = {
      existsOrderIndex: jest.fn(),
      createWithSets: jest.fn(),
      findOwnedById: jest.fn(),
      softDeleteWithSets: jest.fn(),
    };

    getOwnedPlan = jest.fn();
    recomputeWorkoutType = jest.fn();

    exercisesService = {
      findAccessibleByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanExerciseService,
        {
          provide: PLAN_EXERCISES_REPOSITORY,
          useValue: planExercisesRepository,
        },
        {
          provide: WORKOUT_PLAN_CONTEXT,
          useValue: {
            getOwnedPlan,
            recomputeWorkoutType,
          } satisfies IWorkoutPlanContext,
        },
        {
          provide: ExercisesService,
          useValue: exercisesService,
        },
      ],
    }).compile();

    service = module.get(PlanExerciseService);
  });

  describe('create', () => {
    const createParams = {
      exerciseId: 'exercise-id',
      orderIndex: 1,
      notes: null,
      sets: [
        {
          setNumber: 1,
          targetReps: 8,
          targetWeightKg: 60,
          targetRestSec: 90,
        },
      ],
    };

    it('creates exercise and recomputes workout type', async () => {
      const planExercise = createPlanExerciseFixture({ orderIndex: 1 });

      getOwnedPlan.mockResolvedValue(createPlanFixture());
      planExercisesRepository.existsOrderIndex.mockResolvedValue(false);
      exercisesService.findAccessibleByIds.mockResolvedValue([
        createExerciseFixture(),
      ]);
      planExercisesRepository.createWithSets.mockResolvedValue(planExercise);
      recomputeWorkoutType.mockResolvedValue(WorkoutType.CHEST);

      await expect(
        service.create('user-id', 'plan-id', createParams),
      ).resolves.toBe(planExercise);

      expect(getOwnedPlan).toHaveBeenCalledWith('user-id', 'plan-id');
      expect(planExercisesRepository.createWithSets).toHaveBeenCalled();
      expect(recomputeWorkoutType).toHaveBeenCalledWith('plan-id');
    });

    it('rejects duplicate orderIndex', async () => {
      getOwnedPlan.mockResolvedValue(createPlanFixture());
      planExercisesRepository.existsOrderIndex.mockResolvedValue(true);

      await expect(
        service.create('user-id', 'plan-id', createParams),
      ).rejects.toBeInstanceOf(DuplicateOrderIndexException);

      expect(planExercisesRepository.createWithSets).not.toHaveBeenCalled();
      expect(recomputeWorkoutType).not.toHaveBeenCalled();
    });

    it('maps inaccessible exercise to ExerciseNotAccessibleException', async () => {
      getOwnedPlan.mockResolvedValue(createPlanFixture());
      planExercisesRepository.existsOrderIndex.mockResolvedValue(false);
      exercisesService.findAccessibleByIds.mockRejectedValue(
        new ExerciseNotFoundException(),
      );

      await expect(
        service.create('user-id', 'plan-id', createParams),
      ).rejects.toBeInstanceOf(ExerciseNotAccessibleException);

      expect(planExercisesRepository.createWithSets).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft-deletes exercise and recomputes workout type', async () => {
      planExercisesRepository.findOwnedById.mockResolvedValue(
        createPlanExerciseFixture(),
      );
      planExercisesRepository.softDeleteWithSets.mockResolvedValue(undefined);
      recomputeWorkoutType.mockResolvedValue(WorkoutType.FULL_BODY);

      await service.remove('user-id', 'plan-id', 'plan-exercise-id');

      expect(planExercisesRepository.softDeleteWithSets).toHaveBeenCalledWith(
        'plan-exercise-id',
      );
      expect(recomputeWorkoutType).toHaveBeenCalledWith('plan-id');
    });

    it('throws when plan exercise is missing', async () => {
      planExercisesRepository.findOwnedById.mockResolvedValue(null);

      await expect(
        service.remove('user-id', 'plan-id', 'missing'),
      ).rejects.toBeInstanceOf(PlanExerciseNotFoundException);

      expect(planExercisesRepository.softDeleteWithSets).not.toHaveBeenCalled();
      expect(recomputeWorkoutType).not.toHaveBeenCalled();
    });
  });
});
