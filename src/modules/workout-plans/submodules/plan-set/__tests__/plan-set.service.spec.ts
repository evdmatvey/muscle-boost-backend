import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MuscleGroup } from '@/common/enums';
import { DuplicateSetNumberException } from '../../../exceptions/duplicate-set-number.exception';
import { PlanExerciseNotFoundException } from '../../../exceptions/plan-exercise-not-found.exception';
import type { PlanExercise } from '../../plan-exercise/entities/plan-exercise.entity';
import { PlanExerciseService } from '../../plan-exercise/plan-exercise.service';
import type { PlanSet } from '../entities/plan-set.entity';
import { PlanSetService } from '../plan-set.service';
import {
  type IPlanSetsRepository,
  PLAN_SETS_REPOSITORY,
} from '../repositories/plan-sets.repository.interface';

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
  exercise: {
    id: 'exercise-id',
    name: 'Жим',
    description: 'Описание',
    muscleGroup: MuscleGroup.CHEST,
    userId: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  },
  planSets: [],
  ...overrides,
});

const createPlanSetFixture = (overrides: Partial<PlanSet> = {}): PlanSet => ({
  id: 'plan-set-id',
  planExerciseId: 'plan-exercise-id',
  setNumber: 2,
  targetReps: 8,
  targetWeightKg: 60,
  targetRestSec: 90,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

describe('PlanSetService', () => {
  let service: PlanSetService;
  let planSetsRepository: jest.Mocked<
    Pick<IPlanSetsRepository, 'existsSetNumber' | 'create'>
  >;
  let getOwnedPlanExercise: jest.MockedFunction<
    PlanExerciseService['getOwnedPlanExercise']
  >;

  const createParams = {
    setNumber: 2,
    targetReps: 8,
    targetWeightKg: 60,
    targetRestSec: 90,
  };

  beforeEach(async () => {
    planSetsRepository = {
      existsSetNumber: jest.fn(),
      create: jest.fn(),
    };

    getOwnedPlanExercise = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanSetService,
        {
          provide: PLAN_SETS_REPOSITORY,
          useValue: planSetsRepository,
        },
        {
          provide: PlanExerciseService,
          useValue: { getOwnedPlanExercise },
        },
      ],
    }).compile();

    service = module.get(PlanSetService);
  });

  describe('create', () => {
    it('creates set after ownership check', async () => {
      const planSet = createPlanSetFixture();

      getOwnedPlanExercise.mockResolvedValue(createPlanExerciseFixture());
      planSetsRepository.existsSetNumber.mockResolvedValue(false);
      planSetsRepository.create.mockResolvedValue(planSet);

      await expect(
        service.create('user-id', 'plan-id', 'plan-exercise-id', createParams),
      ).resolves.toBe(planSet);

      expect(getOwnedPlanExercise).toHaveBeenCalledWith(
        'user-id',
        'plan-id',
        'plan-exercise-id',
      );
      expect(planSetsRepository.create).toHaveBeenCalledWith({
        planExerciseId: 'plan-exercise-id',
        ...createParams,
      });
    });

    it('rejects duplicate setNumber', async () => {
      getOwnedPlanExercise.mockResolvedValue(createPlanExerciseFixture());
      planSetsRepository.existsSetNumber.mockResolvedValue(true);

      await expect(
        service.create('user-id', 'plan-id', 'plan-exercise-id', createParams),
      ).rejects.toBeInstanceOf(DuplicateSetNumberException);

      expect(planSetsRepository.create).not.toHaveBeenCalled();
    });

    it('throws when plan exercise is missing', async () => {
      getOwnedPlanExercise.mockRejectedValue(
        new PlanExerciseNotFoundException(),
      );

      await expect(
        service.create(
          'user-id',
          'plan-id',
          'missing-plan-exercise',
          createParams,
        ),
      ).rejects.toBeInstanceOf(PlanExerciseNotFoundException);

      expect(planSetsRepository.existsSetNumber).not.toHaveBeenCalled();
      expect(planSetsRepository.create).not.toHaveBeenCalled();
    });
  });
});
