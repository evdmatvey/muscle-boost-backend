import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MuscleGroup, SessionStatus, WorkoutType } from '@/common/enums';
import {
  type Exercise,
  ExerciseNotFoundException,
  ExercisesService,
} from '@/modules/exercises';
import type { WorkoutSession } from '../../../entities/workout-session.entity';
import { DuplicateOrderIndexException } from '../../../exceptions/duplicate-order-index.exception';
import { ExerciseNotAccessibleException } from '../../../exceptions/exercise-not-accessible.exception';
import { SessionNotMutableException } from '../../../exceptions/session-not-mutable.exception';
import {
  type IWorkoutSessionContext,
  WORKOUT_SESSION_CONTEXT,
} from '../../../interfaces/workout-session-context.interface';
import type { SessionExercise } from '../entities/session-exercise.entity';
import {
  type ISessionExercisesRepository,
  SESSION_EXERCISES_REPOSITORY,
} from '../repositories/session-exercises.repository.interface';
import { SessionExerciseService } from '../session-exercise.service';

const createSessionFixture = (
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession => ({
  id: 'session-id',
  userId: 'user-id',
  planId: null,
  startedAt: new Date('2026-07-19T10:00:00.000Z'),
  completedAt: null,
  status: SessionStatus.IN_PROGRESS,
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

const createSessionExerciseFixture = (
  overrides: Partial<SessionExercise> = {},
): SessionExercise => ({
  id: 'session-exercise-id',
  sessionId: 'session-id',
  exerciseId: 'exercise-id',
  orderIndex: 0,
  isSkipped: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  exercise: createExerciseFixture(),
  setLogs: [],
  ...overrides,
});

describe('SessionExerciseService', () => {
  let service: SessionExerciseService;
  let sessionExercisesRepository: jest.Mocked<
    Pick<
      ISessionExercisesRepository,
      | 'existsOrderIndex'
      | 'createWithSets'
      | 'findOwnedById'
      | 'findOwnedDetail'
      | 'updateMeta'
      | 'softDeleteWithSets'
    >
  >;
  let assertMutable: jest.MockedFunction<
    IWorkoutSessionContext['assertMutable']
  >;
  let recomputeWorkoutType: jest.MockedFunction<
    IWorkoutSessionContext['recomputeWorkoutType']
  >;
  let markInProgressIfPlanned: jest.MockedFunction<
    IWorkoutSessionContext['markInProgressIfPlanned']
  >;
  let exercisesService: jest.Mocked<
    Pick<ExercisesService, 'findAccessibleByIds'>
  >;

  beforeEach(async () => {
    sessionExercisesRepository = {
      existsOrderIndex: jest.fn(),
      createWithSets: jest.fn(),
      findOwnedById: jest.fn(),
      findOwnedDetail: jest.fn(),
      updateMeta: jest.fn(),
      softDeleteWithSets: jest.fn(),
    };

    assertMutable = jest.fn();
    recomputeWorkoutType = jest.fn();
    markInProgressIfPlanned = jest.fn();

    exercisesService = {
      findAccessibleByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionExerciseService,
        {
          provide: SESSION_EXERCISES_REPOSITORY,
          useValue: sessionExercisesRepository,
        },
        {
          provide: WORKOUT_SESSION_CONTEXT,
          useValue: {
            getOwnedSession: jest.fn(),
            assertMutable,
            recomputeWorkoutType,
            markInProgressIfPlanned,
          } as IWorkoutSessionContext,
        },
        {
          provide: ExercisesService,
          useValue: exercisesService,
        },
      ],
    }).compile();

    service = module.get(SessionExerciseService);
  });

  describe('create', () => {
    const createParams = {
      exerciseId: 'exercise-id',
      orderIndex: 1,
      sets: [
        {
          setNumber: 1,
          plannedReps: 8,
          plannedWeightKg: 60,
        },
      ],
    };

    it('creates exercise and recomputes workout type', async () => {
      const sessionExercise = createSessionExerciseFixture({ orderIndex: 1 });

      assertMutable.mockResolvedValue(createSessionFixture());
      sessionExercisesRepository.existsOrderIndex.mockResolvedValue(false);
      exercisesService.findAccessibleByIds.mockResolvedValue([
        createExerciseFixture(),
      ]);
      sessionExercisesRepository.createWithSets.mockResolvedValue(
        sessionExercise,
      );
      recomputeWorkoutType.mockResolvedValue(WorkoutType.CHEST);

      await expect(
        service.create('user-id', 'session-id', createParams),
      ).resolves.toBe(sessionExercise);

      expect(assertMutable).toHaveBeenCalledWith('user-id', 'session-id');
      expect(recomputeWorkoutType).toHaveBeenCalledWith('session-id');
      expect(markInProgressIfPlanned).not.toHaveBeenCalled();
    });

    it('marks session in progress when create includes actuals', async () => {
      const sessionExercise = createSessionExerciseFixture({ orderIndex: 1 });

      assertMutable.mockResolvedValue(
        createSessionFixture({ status: SessionStatus.PLANNED }),
      );
      sessionExercisesRepository.existsOrderIndex.mockResolvedValue(false);
      exercisesService.findAccessibleByIds.mockResolvedValue([
        createExerciseFixture(),
      ]);
      sessionExercisesRepository.createWithSets.mockResolvedValue(
        sessionExercise,
      );
      recomputeWorkoutType.mockResolvedValue(WorkoutType.CHEST);
      markInProgressIfPlanned.mockResolvedValue(undefined);

      await service.create('user-id', 'session-id', {
        exerciseId: 'exercise-id',
        orderIndex: 1,
        sets: [
          {
            setNumber: 1,
            plannedReps: 8,
            plannedWeightKg: 60,
            actualReps: 8,
            actualWeightKg: 62.5,
          },
        ],
      });

      expect(markInProgressIfPlanned).toHaveBeenCalledWith('session-id');
    });

    it('rejects when session is not mutable', async () => {
      assertMutable.mockRejectedValue(new SessionNotMutableException());

      await expect(
        service.create('user-id', 'session-id', createParams),
      ).rejects.toBeInstanceOf(SessionNotMutableException);

      expect(sessionExercisesRepository.createWithSets).not.toHaveBeenCalled();
    });

    it('rejects duplicate orderIndex', async () => {
      assertMutable.mockResolvedValue(createSessionFixture());
      sessionExercisesRepository.existsOrderIndex.mockResolvedValue(true);

      await expect(
        service.create('user-id', 'session-id', createParams),
      ).rejects.toBeInstanceOf(DuplicateOrderIndexException);
    });

    it('maps inaccessible exercise to ExerciseNotAccessibleException', async () => {
      assertMutable.mockResolvedValue(createSessionFixture());
      sessionExercisesRepository.existsOrderIndex.mockResolvedValue(false);
      exercisesService.findAccessibleByIds.mockRejectedValue(
        new ExerciseNotFoundException(),
      );

      await expect(
        service.create('user-id', 'session-id', createParams),
      ).rejects.toBeInstanceOf(ExerciseNotAccessibleException);
    });
  });

  describe('update', () => {
    it('allows skip while session is open', async () => {
      const sessionExercise = createSessionExerciseFixture();
      const updated = createSessionExerciseFixture({ isSkipped: true });

      assertMutable.mockResolvedValue(createSessionFixture());
      sessionExercisesRepository.findOwnedById.mockResolvedValue(
        sessionExercise,
      );
      sessionExercisesRepository.updateMeta.mockResolvedValue(updated);
      sessionExercisesRepository.findOwnedDetail.mockResolvedValue(updated);

      await expect(
        service.update('user-id', 'session-id', 'session-exercise-id', {
          isSkipped: true,
        }),
      ).resolves.toBe(updated);

      expect(sessionExercisesRepository.updateMeta).toHaveBeenCalledWith(
        sessionExercise,
        { isSkipped: true },
      );
    });
  });
});
