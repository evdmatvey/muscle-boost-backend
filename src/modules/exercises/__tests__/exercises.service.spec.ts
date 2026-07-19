import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MuscleGroup } from '@/common/enums';
import type { Exercise } from '../entities/exercise.entity';
import { ExerciseSource } from '../enums/exercise-source.enum';
import { ExerciseNotFoundException } from '../exceptions/exercise-not-found.exception';
import { ExercisesService } from '../exercises.service';
import { ExercisesErrorCode } from '../messages/exercises.error-codes';
import {
  EXERCISES_REPOSITORY,
  type IExercisesRepository,
} from '../repositories/exercises.repository.interface';

const createExerciseFixture = (
  overrides: Partial<Exercise> = {},
): Exercise => ({
  id: 'exercise-id',
  name: 'Жим штанги лёжа',
  description: 'Базовое упражнение для грудных мышц.',
  muscleGroup: MuscleGroup.CHEST,
  userId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

describe('ExercisesService', () => {
  let service: ExercisesService;
  let exercisesRepository: jest.Mocked<
    Pick<
      IExercisesRepository,
      'create' | 'findMany' | 'findById' | 'findAccessibleByIds'
    >
  >;

  beforeEach(async () => {
    exercisesRepository = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      findAccessibleByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: EXERCISES_REPOSITORY,
          useValue: exercisesRepository,
        },
      ],
    }).compile();

    service = module.get(ExercisesService);
  });

  describe('list', () => {
    it('passes filters and userId to repository', async () => {
      const result = {
        items: [createExerciseFixture()],
        total: 1,
      };

      exercisesRepository.findMany.mockResolvedValue(result);

      await expect(
        service.list('user-id', {
          muscleGroup: MuscleGroup.CHEST,
          source: ExerciseSource.CATALOG,
          search: 'жим',
          page: 2,
          limit: 10,
        }),
      ).resolves.toBe(result);

      expect(exercisesRepository.findMany).toHaveBeenCalledWith({
        userId: 'user-id',
        muscleGroup: MuscleGroup.CHEST,
        source: ExerciseSource.CATALOG,
        search: 'жим',
        page: 2,
        limit: 10,
      });
    });
  });

  describe('create', () => {
    it('creates exercise owned by current user', async () => {
      const exercise = createExerciseFixture({
        id: 'custom-id',
        name: 'Моё упражнение',
        userId: 'user-id',
        muscleGroup: MuscleGroup.ABS,
      });

      exercisesRepository.create.mockResolvedValue(exercise);

      await expect(
        service.create('user-id', {
          name: 'Моё упражнение',
          description: 'Описание',
          muscleGroup: MuscleGroup.ABS,
        }),
      ).resolves.toBe(exercise);

      expect(exercisesRepository.create).toHaveBeenCalledWith({
        name: 'Моё упражнение',
        description: 'Описание',
        muscleGroup: MuscleGroup.ABS,
        userId: 'user-id',
      });
    });
  });

  describe('findById', () => {
    it('returns exercise when found', async () => {
      const exercise = createExerciseFixture();

      exercisesRepository.findById.mockResolvedValue(exercise);

      await expect(service.findById(exercise.id)).resolves.toBe(exercise);
    });

    it('throws ExerciseNotFoundException when missing', async () => {
      exercisesRepository.findById.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toMatchObject({
        code: ExercisesErrorCode.EXERCISE_NOT_FOUND,
      });

      await expect(service.findById('missing-id')).rejects.toBeInstanceOf(
        ExerciseNotFoundException,
      );
    });
  });

  describe('findAccessibleByIds', () => {
    it('returns exercises when all ids are accessible', async () => {
      const exercise = createExerciseFixture();

      exercisesRepository.findAccessibleByIds.mockResolvedValue([exercise]);

      await expect(
        service.findAccessibleByIds('user-id', [exercise.id, exercise.id]),
      ).resolves.toEqual([exercise]);

      expect(exercisesRepository.findAccessibleByIds).toHaveBeenCalledWith(
        'user-id',
        [exercise.id],
      );
    });

    it('throws when some ids are missing or inaccessible', async () => {
      exercisesRepository.findAccessibleByIds.mockResolvedValue([]);

      await expect(
        service.findAccessibleByIds('user-id', ['missing-id']),
      ).rejects.toBeInstanceOf(ExerciseNotFoundException);
    });
  });
});
