import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MuscleGroup, SessionStatus, WorkoutType } from '@/common/enums';
import {
  type Exercise,
  ExerciseNotFoundException,
  ExercisesService,
} from '@/modules/exercises';
import { type WorkoutPlan, WorkoutPlansService } from '@/modules/workout-plans';
import type { WorkoutSession } from '../entities/workout-session.entity';
import { DuplicateOrderIndexException } from '../exceptions/duplicate-order-index.exception';
import { ExerciseNotAccessibleException } from '../exceptions/exercise-not-accessible.exception';
import { InvalidCreateSessionPayloadException } from '../exceptions/invalid-create-session-payload.exception';
import { InvalidSessionTransitionException } from '../exceptions/invalid-session-transition.exception';
import { SessionNotMutableException } from '../exceptions/session-not-mutable.exception';
import { WorkoutSessionNotFoundException } from '../exceptions/workout-session-not-found.exception';
import { WorkoutSessionsErrorCode } from '../messages/workout-sessions.error-codes';
import {
  type IWorkoutSessionsRepository,
  WORKOUT_SESSIONS_REPOSITORY,
} from '../repositories/workout-sessions.repository.interface';
import { WorkoutSessionsService } from '../workout-sessions.service';

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

const createSessionFixture = (
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession => ({
  id: 'session-id',
  userId: 'user-id',
  planId: null,
  startedAt: new Date('2026-07-19T10:00:00.000Z'),
  completedAt: null,
  status: SessionStatus.PLANNED,
  workoutType: WorkoutType.CHEST,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  sessionExercises: [],
  ...overrides,
});

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
  planExercises: [
    {
      id: 'plan-exercise-id',
      planId: 'plan-id',
      exerciseId: 'exercise-id',
      orderIndex: 0,
      notes: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
      planSets: [
        {
          id: 'plan-set-id',
          planExerciseId: 'plan-exercise-id',
          setNumber: 1,
          targetReps: 8,
          targetWeightKg: 60,
          targetRestSec: 120,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          deletedAt: null,
        },
      ],
    },
  ],
  ...overrides,
});

describe('WorkoutSessionsService', () => {
  let service: WorkoutSessionsService;
  let workoutSessionsRepository: jest.Mocked<
    Pick<
      IWorkoutSessionsRepository,
      | 'findMany'
      | 'findOwnedById'
      | 'findOwnedDetail'
      | 'createAggregate'
      | 'updateStartedAt'
      | 'updateStatus'
      | 'softDeleteTree'
      | 'findMuscleGroupsBySessionId'
      | 'updateWorkoutType'
      | 'markInProgressIfPlanned'
    >
  >;
  let workoutPlansService: jest.Mocked<Pick<WorkoutPlansService, 'getById'>>;
  let exercisesService: jest.Mocked<
    Pick<ExercisesService, 'findAccessibleByIds'>
  >;

  beforeEach(async () => {
    workoutSessionsRepository = {
      findMany: jest.fn(),
      findOwnedById: jest.fn(),
      findOwnedDetail: jest.fn(),
      createAggregate: jest.fn(),
      updateStartedAt: jest.fn(),
      updateStatus: jest.fn(),
      softDeleteTree: jest.fn(),
      findMuscleGroupsBySessionId: jest.fn(),
      updateWorkoutType: jest.fn(),
      markInProgressIfPlanned: jest.fn(),
    };

    workoutPlansService = {
      getById: jest.fn(),
    };

    exercisesService = {
      findAccessibleByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutSessionsService,
        {
          provide: WORKOUT_SESSIONS_REPOSITORY,
          useValue: workoutSessionsRepository,
        },
        {
          provide: WorkoutPlansService,
          useValue: workoutPlansService,
        },
        {
          provide: ExercisesService,
          useValue: exercisesService,
        },
      ],
    }).compile();

    service = module.get(WorkoutSessionsService);
  });

  describe('create', () => {
    it('creates session from plan with snapshot sets', async () => {
      const plan = createPlanFixture();
      const session = createSessionFixture({ planId: plan.id });

      workoutPlansService.getById.mockResolvedValue(plan);
      workoutSessionsRepository.createAggregate.mockResolvedValue(session);

      await expect(
        service.create('user-id', {
          planId: 'plan-id',
          startedAt: '2026-07-19T10:00:00.000Z',
        }),
      ).resolves.toBe(session);

      expect(workoutSessionsRepository.createAggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          planId: 'plan-id',
          status: SessionStatus.PLANNED,
          workoutType: WorkoutType.CHEST,
          exercises: [
            expect.objectContaining({
              exerciseId: 'exercise-id',
              orderIndex: 0,
              isSkipped: false,
              sets: [
                expect.objectContaining({
                  setNumber: 1,
                  plannedReps: 8,
                  plannedWeightKg: 60,
                  actualReps: null,
                  actualWeightKg: null,
                }),
              ],
            }),
          ],
        }),
      );
    });

    it('creates ad-hoc session with computed workout type', async () => {
      const session = createSessionFixture();
      const exercise = createExerciseFixture();

      exercisesService.findAccessibleByIds.mockResolvedValue([exercise]);
      workoutSessionsRepository.createAggregate.mockResolvedValue(session);

      await service.create('user-id', {
        startedAt: '2026-07-19T10:00:00.000Z',
        startNow: true,
        exercises: [
          {
            exerciseId: exercise.id,
            orderIndex: 0,
            sets: [
              {
                setNumber: 1,
                plannedReps: 10,
                plannedWeightKg: 50,
              },
            ],
          },
        ],
      });

      expect(workoutSessionsRepository.createAggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: null,
          status: SessionStatus.IN_PROGRESS,
          workoutType: WorkoutType.CHEST,
        }),
      );
    });

    it('rejects planId together with exercises', async () => {
      await expect(
        service.create('user-id', {
          planId: 'plan-id',
          startedAt: '2026-07-19T10:00:00.000Z',
          exercises: [],
        }),
      ).rejects.toBeInstanceOf(InvalidCreateSessionPayloadException);
    });

    it('maps inaccessible exercise to ExerciseNotAccessibleException', async () => {
      exercisesService.findAccessibleByIds.mockRejectedValue(
        new ExerciseNotFoundException(),
      );

      await expect(
        service.create('user-id', {
          startedAt: '2026-07-19T10:00:00.000Z',
          exercises: [
            {
              exerciseId: 'missing',
              orderIndex: 0,
              sets: [
                {
                  setNumber: 1,
                  plannedReps: 8,
                  plannedWeightKg: 40,
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
          startedAt: '2026-07-19T10:00:00.000Z',
          exercises: [
            {
              exerciseId: 'a',
              orderIndex: 0,
              sets: [{ setNumber: 1, plannedReps: 8, plannedWeightKg: 40 }],
            },
            {
              exerciseId: 'b',
              orderIndex: 0,
              sets: [{ setNumber: 1, plannedReps: 8, plannedWeightKg: 40 }],
            },
          ],
        }),
      ).rejects.toBeInstanceOf(DuplicateOrderIndexException);
    });

    it('sets IN_PROGRESS when create includes actuals without startNow', async () => {
      const session = createSessionFixture({
        status: SessionStatus.IN_PROGRESS,
      });
      const exercise = createExerciseFixture();

      exercisesService.findAccessibleByIds.mockResolvedValue([exercise]);
      workoutSessionsRepository.createAggregate.mockResolvedValue(session);

      await service.create('user-id', {
        startedAt: '2026-07-19T10:00:00.000Z',
        exercises: [
          {
            exerciseId: exercise.id,
            orderIndex: 0,
            sets: [
              {
                setNumber: 1,
                plannedReps: 8,
                plannedWeightKg: 60,
                actualReps: 8,
                actualWeightKg: 60,
              },
            ],
          },
        ],
      });

      expect(workoutSessionsRepository.createAggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SessionStatus.IN_PROGRESS,
        }),
      );
    });
  });

  describe('lifecycle', () => {
    it('starts planned session', async () => {
      const planned = createSessionFixture();
      const started = createSessionFixture({
        status: SessionStatus.IN_PROGRESS,
      });

      workoutSessionsRepository.findOwnedById.mockResolvedValue(planned);
      workoutSessionsRepository.updateStatus.mockResolvedValue(started);
      workoutSessionsRepository.findOwnedDetail.mockResolvedValue(started);

      await expect(service.start('user-id', 'session-id')).resolves.toBe(
        started,
      );

      expect(workoutSessionsRepository.updateStatus).toHaveBeenCalledWith(
        'session-id',
        SessionStatus.IN_PROGRESS,
      );
    });

    it('completes mutable session', async () => {
      const inProgress = createSessionFixture({
        status: SessionStatus.IN_PROGRESS,
      });
      const completed = createSessionFixture({
        status: SessionStatus.COMPLETED,
        completedAt: new Date('2026-07-19T11:00:00.000Z'),
      });

      workoutSessionsRepository.findOwnedById.mockResolvedValue(inProgress);
      workoutSessionsRepository.updateStatus.mockResolvedValue(completed);
      workoutSessionsRepository.findOwnedDetail.mockResolvedValue(completed);

      await expect(service.complete('user-id', 'session-id')).resolves.toBe(
        completed,
      );

      expect(workoutSessionsRepository.updateStatus).toHaveBeenCalledWith(
        'session-id',
        SessionStatus.COMPLETED,
        expect.any(Date),
      );
    });

    it('rejects complete when already completed', async () => {
      workoutSessionsRepository.findOwnedById.mockResolvedValue(
        createSessionFixture({ status: SessionStatus.COMPLETED }),
      );

      await expect(
        service.complete('user-id', 'session-id'),
      ).rejects.toMatchObject({
        code: WorkoutSessionsErrorCode.SESSION_NOT_MUTABLE,
      });

      await expect(
        service.complete('user-id', 'session-id'),
      ).rejects.toBeInstanceOf(SessionNotMutableException);
    });

    it('rejects start when session is already in progress', async () => {
      workoutSessionsRepository.findOwnedById.mockResolvedValue(
        createSessionFixture({ status: SessionStatus.IN_PROGRESS }),
      );

      await expect(
        service.start('user-id', 'session-id'),
      ).rejects.toMatchObject({
        code: WorkoutSessionsErrorCode.INVALID_SESSION_TRANSITION,
      });

      await expect(
        service.start('user-id', 'session-id'),
      ).rejects.toBeInstanceOf(InvalidSessionTransitionException);

      expect(workoutSessionsRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('rejects update when session is cancelled', async () => {
      workoutSessionsRepository.findOwnedById.mockResolvedValue(
        createSessionFixture({ status: SessionStatus.CANCELLED }),
      );

      await expect(
        service.update('user-id', 'session-id', {
          startedAt: '2026-07-20T10:00:00.000Z',
        }),
      ).rejects.toBeInstanceOf(SessionNotMutableException);

      expect(workoutSessionsRepository.updateStartedAt).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('throws when session is missing', async () => {
      workoutSessionsRepository.findOwnedDetail.mockResolvedValue(null);

      await expect(
        service.getById('user-id', 'missing'),
      ).rejects.toBeInstanceOf(WorkoutSessionNotFoundException);
    });
  });

  describe('remove', () => {
    it('soft-deletes owned session tree', async () => {
      workoutSessionsRepository.findOwnedById.mockResolvedValue(
        createSessionFixture(),
      );
      workoutSessionsRepository.softDeleteTree.mockResolvedValue(undefined);

      await service.remove('user-id', 'session-id');

      expect(workoutSessionsRepository.softDeleteTree).toHaveBeenCalledWith(
        'session-id',
      );
    });
  });
});
