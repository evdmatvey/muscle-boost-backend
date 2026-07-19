import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MuscleGroup, SessionStatus, WorkoutType } from '@/common/enums';
import { DuplicateSetNumberException } from '../../../exceptions/duplicate-set-number.exception';
import { SessionNotMutableException } from '../../../exceptions/session-not-mutable.exception';
import {
  type IWorkoutSessionContext,
  WORKOUT_SESSION_CONTEXT,
} from '../../../interfaces/workout-session-context.interface';
import type { SessionExercise } from '../../session-exercise/entities/session-exercise.entity';
import { SessionExerciseService } from '../../session-exercise/session-exercise.service';
import type { SetLog } from '../entities/set-log.entity';
import {
  type ISetLogsRepository,
  SET_LOGS_REPOSITORY,
} from '../repositories/set-logs.repository.interface';
import { SetLogService } from '../set-log.service';

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
  setLogs: [],
  ...overrides,
});

const createSetLogFixture = (overrides: Partial<SetLog> = {}): SetLog => ({
  id: 'set-log-id',
  sessionExerciseId: 'session-exercise-id',
  setNumber: 1,
  plannedReps: 8,
  plannedWeightKg: 60,
  actualReps: null,
  actualWeightKg: null,
  rpe: null,
  isWarmup: false,
  completedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

describe('SetLogService', () => {
  let service: SetLogService;
  let setLogsRepository: jest.Mocked<
    Pick<
      ISetLogsRepository,
      | 'existsSetNumber'
      | 'create'
      | 'findOwnedById'
      | 'updateMeta'
      | 'softDelete'
    >
  >;
  let getOwnedSessionExercise: jest.MockedFunction<
    SessionExerciseService['getOwnedSessionExercise']
  >;
  let assertMutable: jest.MockedFunction<
    IWorkoutSessionContext['assertMutable']
  >;
  let markInProgressIfPlanned: jest.MockedFunction<
    IWorkoutSessionContext['markInProgressIfPlanned']
  >;

  beforeEach(async () => {
    setLogsRepository = {
      existsSetNumber: jest.fn(),
      create: jest.fn(),
      findOwnedById: jest.fn(),
      updateMeta: jest.fn(),
      softDelete: jest.fn(),
    };

    getOwnedSessionExercise = jest.fn();
    assertMutable = jest.fn();
    markInProgressIfPlanned = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetLogService,
        {
          provide: SET_LOGS_REPOSITORY,
          useValue: setLogsRepository,
        },
        {
          provide: SessionExerciseService,
          useValue: { getOwnedSessionExercise },
        },
        {
          provide: WORKOUT_SESSION_CONTEXT,
          useValue: {
            getOwnedSession: jest.fn(),
            assertMutable,
            recomputeWorkoutType: jest.fn(),
            markInProgressIfPlanned,
          } as IWorkoutSessionContext,
        },
      ],
    }).compile();

    service = module.get(SetLogService);
  });

  describe('update', () => {
    it('allows repeated patch while session is open', async () => {
      const existing = createSetLogFixture({
        actualReps: 8,
        actualWeightKg: 60,
      });
      const updated = createSetLogFixture({
        actualReps: 10,
        actualWeightKg: 62.5,
        rpe: 8,
      });

      assertMutable.mockResolvedValue({
        id: 'session-id',
        userId: 'user-id',
        planId: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.IN_PROGRESS,
        workoutType: WorkoutType.CHEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      setLogsRepository.findOwnedById.mockResolvedValue(existing);
      setLogsRepository.updateMeta.mockResolvedValue(updated);

      await expect(
        service.update(
          'user-id',
          'session-id',
          'session-exercise-id',
          'set-log-id',
          { actualReps: 10, actualWeightKg: 62.5, rpe: 8 },
        ),
      ).resolves.toBe(updated);

      expect(setLogsRepository.updateMeta).toHaveBeenCalled();
      expect(markInProgressIfPlanned).toHaveBeenCalledWith('session-id');
    });

    it('rejects patch when session is completed', async () => {
      assertMutable.mockRejectedValue(new SessionNotMutableException());

      await expect(
        service.update(
          'user-id',
          'session-id',
          'session-exercise-id',
          'set-log-id',
          { actualReps: 10, actualWeightKg: 60 },
        ),
      ).rejects.toBeInstanceOf(SessionNotMutableException);

      expect(setLogsRepository.findOwnedById).not.toHaveBeenCalled();
    });

    it('marks planned session in progress on first actual values', async () => {
      const existing = createSetLogFixture();
      const updated = createSetLogFixture({
        actualReps: 8,
        actualWeightKg: 60,
        completedAt: new Date(),
      });

      assertMutable.mockResolvedValue({
        id: 'session-id',
        userId: 'user-id',
        planId: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.PLANNED,
        workoutType: WorkoutType.CHEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      setLogsRepository.findOwnedById.mockResolvedValue(existing);
      setLogsRepository.updateMeta.mockResolvedValue(updated);

      await service.update(
        'user-id',
        'session-id',
        'session-exercise-id',
        'set-log-id',
        { actualReps: 8, actualWeightKg: 60 },
      );

      expect(markInProgressIfPlanned).toHaveBeenCalledWith('session-id');
    });
  });

  describe('create', () => {
    it('rejects duplicate setNumber', async () => {
      assertMutable.mockResolvedValue({
        id: 'session-id',
        userId: 'user-id',
        planId: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.IN_PROGRESS,
        workoutType: WorkoutType.CHEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      getOwnedSessionExercise.mockResolvedValue(createSessionExerciseFixture());
      setLogsRepository.existsSetNumber.mockResolvedValue(true);

      await expect(
        service.create('user-id', 'session-id', 'session-exercise-id', {
          setNumber: 1,
          plannedReps: 8,
          plannedWeightKg: 60,
        }),
      ).rejects.toBeInstanceOf(DuplicateSetNumberException);

      expect(setLogsRepository.create).not.toHaveBeenCalled();
    });
  });
});
