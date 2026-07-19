import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MuscleGroup, WorkoutType } from '@/common/enums';
import {
  type Exercise,
  ExerciseNotFoundException,
  ExercisesService,
} from '@/modules/exercises';
import type { WorkoutPlan } from '../entities/workout-plan.entity';
import { DuplicateOrderIndexException } from '../exceptions/duplicate-order-index.exception';
import { ExerciseNotAccessibleException } from '../exceptions/exercise-not-accessible.exception';
import { WorkoutPlanNotFoundException } from '../exceptions/workout-plan-not-found.exception';
import { WorkoutPlansErrorCode } from '../messages/workout-plans.error-codes';
import {
  type IWorkoutPlansRepository,
  WORKOUT_PLANS_REPOSITORY,
} from '../repositories/workout-plans.repository.interface';
import { WorkoutPlansService } from '../workout-plans.service';

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

const createPlanFixture = (
  overrides: Partial<WorkoutPlan> = {},
): WorkoutPlan => ({
  id: 'plan-id',
  userId: 'user-id',
  name: 'Push Day',
  notes: null,
  workoutType: WorkoutType.PUSH,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  planExercises: [],
  ...overrides,
});

describe('WorkoutPlansService', () => {
  let service: WorkoutPlansService;
  let workoutPlansRepository: jest.Mocked<
    Pick<
      IWorkoutPlansRepository,
      | 'findMany'
      | 'findOwnedById'
      | 'findOwnedDetail'
      | 'createAggregate'
      | 'replaceAggregate'
      | 'updateMeta'
      | 'softDeleteTree'
      | 'findMuscleGroupsByPlanId'
      | 'updateWorkoutType'
    >
  >;
  let exercisesService: jest.Mocked<
    Pick<ExercisesService, 'findAccessibleByIds'>
  >;

  beforeEach(async () => {
    workoutPlansRepository = {
      findMany: jest.fn(),
      findOwnedById: jest.fn(),
      findOwnedDetail: jest.fn(),
      createAggregate: jest.fn(),
      replaceAggregate: jest.fn(),
      updateMeta: jest.fn(),
      softDeleteTree: jest.fn(),
      findMuscleGroupsByPlanId: jest.fn(),
      updateWorkoutType: jest.fn(),
    };

    exercisesService = {
      findAccessibleByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlansService,
        {
          provide: WORKOUT_PLANS_REPOSITORY,
          useValue: workoutPlansRepository,
        },
        {
          provide: ExercisesService,
          useValue: exercisesService,
        },
      ],
    }).compile();

    service = module.get(WorkoutPlansService);
  });

  describe('create', () => {
    it('creates plan with computed workout type', async () => {
      const plan = createPlanFixture();
      const exercise = createExerciseFixture({
        muscleGroup: MuscleGroup.CHEST,
      });

      exercisesService.findAccessibleByIds.mockResolvedValue([exercise]);
      workoutPlansRepository.createAggregate.mockResolvedValue(plan);

      await expect(
        service.create('user-id', {
          name: 'Push Day',
          notes: null,
          exercises: [
            {
              exerciseId: exercise.id,
              orderIndex: 0,
              notes: null,
              sets: [
                {
                  setNumber: 1,
                  targetReps: 8,
                  targetWeightKg: 60,
                  targetRestSec: 120,
                },
              ],
            },
          ],
        }),
      ).resolves.toBe(plan);

      expect(workoutPlansRepository.createAggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          name: 'Push Day',
          workoutType: WorkoutType.CHEST,
        }),
      );
    });

    it('creates empty draft as FULL_BODY', async () => {
      const plan = createPlanFixture({ workoutType: WorkoutType.FULL_BODY });

      exercisesService.findAccessibleByIds.mockResolvedValue([]);
      workoutPlansRepository.createAggregate.mockResolvedValue(plan);

      await service.create('user-id', { name: 'Draft' });

      expect(workoutPlansRepository.createAggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          workoutType: WorkoutType.FULL_BODY,
          exercises: [],
        }),
      );
    });

    it('maps inaccessible exercise to ExerciseNotAccessibleException', async () => {
      exercisesService.findAccessibleByIds.mockRejectedValue(
        new ExerciseNotFoundException(),
      );

      await expect(
        service.create('user-id', {
          name: 'Push Day',
          exercises: [
            {
              exerciseId: 'missing',
              orderIndex: 0,
              notes: null,
              sets: [
                {
                  setNumber: 1,
                  targetReps: 8,
                  targetWeightKg: 60,
                  targetRestSec: 90,
                },
              ],
            },
          ],
        }),
      ).rejects.toBeInstanceOf(ExerciseNotAccessibleException);
    });

    it('rejects duplicate orderIndex', async () => {
      await expect(
        service.create('user-id', {
          name: 'Push Day',
          exercises: [
            {
              exerciseId: 'a',
              orderIndex: 0,
              notes: null,
              sets: [
                {
                  setNumber: 1,
                  targetReps: 8,
                  targetWeightKg: 40,
                  targetRestSec: 60,
                },
              ],
            },
            {
              exerciseId: 'b',
              orderIndex: 0,
              notes: null,
              sets: [
                {
                  setNumber: 1,
                  targetReps: 8,
                  targetWeightKg: 40,
                  targetRestSec: 60,
                },
              ],
            },
          ],
        }),
      ).rejects.toBeInstanceOf(DuplicateOrderIndexException);
    });
  });

  describe('getById', () => {
    it('throws when plan is missing', async () => {
      workoutPlansRepository.findOwnedDetail.mockResolvedValue(null);

      await expect(service.getById('user-id', 'missing')).rejects.toMatchObject(
        {
          code: WorkoutPlansErrorCode.WORKOUT_PLAN_NOT_FOUND,
        },
      );

      await expect(
        service.getById('user-id', 'missing'),
      ).rejects.toBeInstanceOf(WorkoutPlanNotFoundException);
    });
  });

  describe('recomputeWorkoutType', () => {
    it('updates plan type from muscle groups', async () => {
      workoutPlansRepository.findMuscleGroupsByPlanId.mockResolvedValue([
        MuscleGroup.BACK,
        MuscleGroup.BICEPS,
      ]);
      workoutPlansRepository.updateWorkoutType.mockResolvedValue(
        createPlanFixture({ workoutType: WorkoutType.PULL }),
      );

      await expect(service.recomputeWorkoutType('plan-id')).resolves.toBe(
        WorkoutType.PULL,
      );

      expect(workoutPlansRepository.updateWorkoutType).toHaveBeenCalledWith(
        'plan-id',
        WorkoutType.PULL,
      );
    });
  });

  describe('replace', () => {
    it('rewrites aggregate after ownership check', async () => {
      const plan = createPlanFixture({ workoutType: WorkoutType.CHEST });
      const exercise = createExerciseFixture();

      workoutPlansRepository.findOwnedById.mockResolvedValue(plan);
      exercisesService.findAccessibleByIds.mockResolvedValue([exercise]);
      workoutPlansRepository.replaceAggregate.mockResolvedValue(plan);

      await expect(
        service.replace('user-id', 'plan-id', {
          name: 'Chest Day',
          notes: 'note',
          exercises: [
            {
              exerciseId: exercise.id,
              orderIndex: 0,
              notes: null,
              sets: [
                {
                  setNumber: 1,
                  targetReps: 10,
                  targetWeightKg: 50,
                  targetRestSec: 60,
                },
              ],
            },
          ],
        }),
      ).resolves.toBe(plan);

      expect(workoutPlansRepository.findOwnedById).toHaveBeenCalledWith(
        'user-id',
        'plan-id',
      );
      expect(workoutPlansRepository.replaceAggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: 'plan-id',
          name: 'Chest Day',
          notes: 'note',
          workoutType: WorkoutType.CHEST,
        }),
      );
    });

    it('throws when plan is not owned', async () => {
      workoutPlansRepository.findOwnedById.mockResolvedValue(null);

      await expect(
        service.replace('user-id', 'missing', { name: 'X' }),
      ).rejects.toBeInstanceOf(WorkoutPlanNotFoundException);

      expect(workoutPlansRepository.replaceAggregate).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates meta and returns detail', async () => {
      const plan = createPlanFixture({ name: 'Old' });
      const detail = createPlanFixture({ name: 'New' });

      workoutPlansRepository.findOwnedById.mockResolvedValue(plan);
      workoutPlansRepository.updateMeta.mockResolvedValue(plan);
      workoutPlansRepository.findOwnedDetail.mockResolvedValue(detail);

      await expect(
        service.update('user-id', 'plan-id', { name: 'New' }),
      ).resolves.toBe(detail);

      expect(workoutPlansRepository.updateMeta).toHaveBeenCalledWith(plan, {
        name: 'New',
      });
    });
  });

  describe('remove', () => {
    it('soft-deletes owned plan tree', async () => {
      workoutPlansRepository.findOwnedById.mockResolvedValue(
        createPlanFixture(),
      );
      workoutPlansRepository.softDeleteTree.mockResolvedValue(undefined);

      await service.remove('user-id', 'plan-id');

      expect(workoutPlansRepository.softDeleteTree).toHaveBeenCalledWith(
        'plan-id',
      );
    });

    it('throws when plan is missing', async () => {
      workoutPlansRepository.findOwnedById.mockResolvedValue(null);

      await expect(service.remove('user-id', 'missing')).rejects.toBeInstanceOf(
        WorkoutPlanNotFoundException,
      );

      expect(workoutPlansRepository.softDeleteTree).not.toHaveBeenCalled();
    });
  });
});
