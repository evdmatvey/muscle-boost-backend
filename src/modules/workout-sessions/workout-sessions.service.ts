import { Inject, Injectable } from '@nestjs/common';
import { SessionStatus, type WorkoutType } from '@/common/enums';
import { ExercisesService } from '@/modules/exercises';
import {
  WorkoutPlansService,
  resolveWorkoutType,
} from '@/modules/workout-plans';
import type { WorkoutSession } from './entities/workout-session.entity';
import { InvalidCreateSessionPayloadException } from './exceptions/invalid-create-session-payload.exception';
import { InvalidSessionTransitionException } from './exceptions/invalid-session-transition.exception';
import { SessionNotMutableException } from './exceptions/session-not-mutable.exception';
import { WorkoutSessionNotFoundException } from './exceptions/workout-session-not-found.exception';
import type { IWorkoutSessionContext } from './interfaces/workout-session-context.interface';
import {
  type FindWorkoutSessionsResult,
  type IWorkoutSessionsRepository,
  WORKOUT_SESSIONS_REPOSITORY,
} from './repositories/workout-sessions.repository.interface';
import type { SessionExerciseInput } from './types/session-aggregate.types';
import {
  assertExercisesAccessible,
  assertUniqueOrderIndexes,
  assertUniqueSetNumbersPerExercise,
} from './utils/assert-session-exercises.util';
import { isSessionMutable } from './utils/is-session-mutable.util';
import { resolveInitialSessionStatus } from './utils/resolve-initial-session-status.util';
import {
  type SetLogFieldsInput,
  resolveSetLogFields,
} from './utils/resolve-set-log-fields.util';

export type ListWorkoutSessionsParams = {
  workoutType?: WorkoutType;
  status?: SessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  limit: number;
};

export type CreateSessionSetParams = SetLogFieldsInput;

export type CreateSessionExerciseParams = {
  exerciseId: string;
  orderIndex: number;
  isSkipped?: boolean;
  sets: CreateSessionSetParams[];
};

export type CreateWorkoutSessionParams = {
  planId?: string;
  startedAt: string;
  startNow?: boolean;
  exercises?: CreateSessionExerciseParams[];
};

export type UpdateWorkoutSessionParams = {
  startedAt?: string;
};

type PreparedAggregate = {
  planId: string | null;
  startedAt: Date;
  status: SessionStatus;
  workoutType: WorkoutType;
  exercises: SessionExerciseInput[];
};

@Injectable()
export class WorkoutSessionsService implements IWorkoutSessionContext {
  public constructor(
    @Inject(WORKOUT_SESSIONS_REPOSITORY)
    private readonly _workoutSessionsRepository: IWorkoutSessionsRepository,
    private readonly _workoutPlansService: WorkoutPlansService,
    private readonly _exercisesService: ExercisesService,
  ) {}

  public async list(
    userId: string,
    params: ListWorkoutSessionsParams,
  ): Promise<FindWorkoutSessionsResult> {
    return this._workoutSessionsRepository.findMany({
      userId,
      workoutType: params.workoutType,
      status: params.status,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      page: params.page,
      limit: params.limit,
    });
  }

  public async getById(userId: string, id: string): Promise<WorkoutSession> {
    const session = await this._workoutSessionsRepository.findOwnedDetail(
      userId,
      id,
    );

    if (!session) {
      throw new WorkoutSessionNotFoundException();
    }

    return session;
  }

  public async create(
    userId: string,
    params: CreateWorkoutSessionParams,
  ): Promise<WorkoutSession> {
    const prepared = await this._prepareCreate(userId, params);

    return this._workoutSessionsRepository.createAggregate({
      userId,
      planId: prepared.planId,
      startedAt: prepared.startedAt,
      status: prepared.status,
      workoutType: prepared.workoutType,
      exercises: prepared.exercises,
    });
  }

  public async update(
    userId: string,
    id: string,
    params: UpdateWorkoutSessionParams,
  ): Promise<WorkoutSession> {
    const session = await this.assertMutable(userId, id);

    if (params.startedAt !== undefined) {
      await this._workoutSessionsRepository.updateStartedAt(
        session,
        new Date(params.startedAt),
      );
    }

    return this.getById(userId, id);
  }

  public async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedSession(userId, id);
    await this._workoutSessionsRepository.softDeleteTree(id);
  }

  public async start(userId: string, id: string): Promise<WorkoutSession> {
    const session = await this.getOwnedSession(userId, id);

    if (session.status !== SessionStatus.PLANNED) {
      throw new InvalidSessionTransitionException();
    }

    await this._workoutSessionsRepository.updateStatus(
      id,
      SessionStatus.IN_PROGRESS,
    );

    return this.getById(userId, id);
  }

  public async complete(userId: string, id: string): Promise<WorkoutSession> {
    const session = await this.getOwnedSession(userId, id);

    if (!isSessionMutable(session.status)) {
      throw new SessionNotMutableException();
    }

    await this._workoutSessionsRepository.updateStatus(
      id,
      SessionStatus.COMPLETED,
      new Date(),
    );

    return this.getById(userId, id);
  }

  public async cancel(userId: string, id: string): Promise<WorkoutSession> {
    const session = await this.getOwnedSession(userId, id);

    if (!isSessionMutable(session.status)) {
      throw new SessionNotMutableException();
    }

    await this._workoutSessionsRepository.updateStatus(
      id,
      SessionStatus.CANCELLED,
      null,
    );

    return this.getById(userId, id);
  }

  public async getOwnedSession(
    userId: string,
    id: string,
  ): Promise<WorkoutSession> {
    const session = await this._workoutSessionsRepository.findOwnedById(
      userId,
      id,
    );

    if (!session) {
      throw new WorkoutSessionNotFoundException();
    }

    return session;
  }

  public async assertMutable(
    userId: string,
    id: string,
  ): Promise<WorkoutSession> {
    const session = await this.getOwnedSession(userId, id);

    if (!isSessionMutable(session.status)) {
      throw new SessionNotMutableException();
    }

    return session;
  }

  public async recomputeWorkoutType(sessionId: string): Promise<WorkoutType> {
    const muscleGroups =
      await this._workoutSessionsRepository.findMuscleGroupsBySessionId(
        sessionId,
      );
    const workoutType = resolveWorkoutType(muscleGroups);

    await this._workoutSessionsRepository.updateWorkoutType(
      sessionId,
      workoutType,
    );

    return workoutType;
  }

  public async markInProgressIfPlanned(sessionId: string): Promise<void> {
    await this._workoutSessionsRepository.markInProgressIfPlanned(sessionId);
  }

  private async _prepareCreate(
    userId: string,
    params: CreateWorkoutSessionParams,
  ): Promise<PreparedAggregate> {
    const planId = params.planId;

    if (planId !== undefined && params.exercises !== undefined) {
      throw new InvalidCreateSessionPayloadException();
    }

    const startedAt = new Date(params.startedAt);

    if (planId !== undefined) {
      const plan = await this._workoutPlansService.getById(userId, planId);
      const planExercises = (plan.planExercises ?? [])
        .slice()
        .sort((left, right) => left.orderIndex - right.orderIndex);

      const exercises: SessionExerciseInput[] = planExercises.map(
        (planExercise) => ({
          exerciseId: planExercise.exerciseId,
          orderIndex: planExercise.orderIndex,
          isSkipped: false,
          sets: (planExercise.planSets ?? [])
            .slice()
            .sort((left, right) => left.setNumber - right.setNumber)
            .map((planSet) =>
              resolveSetLogFields({
                setNumber: planSet.setNumber,
                plannedReps: planSet.targetReps,
                plannedWeightKg: planSet.targetWeightKg,
              }),
            ),
        }),
      );

      return {
        planId: plan.id,
        startedAt,
        status: resolveInitialSessionStatus(params.startNow, []),
        workoutType: plan.workoutType,
        exercises,
      };
    }

    const exercisesInput = params.exercises ?? [];

    assertUniqueOrderIndexes(exercisesInput);
    assertUniqueSetNumbersPerExercise(exercisesInput);

    const accessibleExercises = await assertExercisesAccessible(
      this._exercisesService,
      userId,
      exercisesInput.map((exercise) => exercise.exerciseId),
    );

    const exercises = exercisesInput.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      orderIndex: exercise.orderIndex,
      isSkipped: exercise.isSkipped ?? false,
      sets: exercise.sets.map((set) => resolveSetLogFields(set)),
    }));

    return {
      planId: null,
      startedAt,
      status: resolveInitialSessionStatus(
        params.startNow,
        exercises.map((exercise) => exercise.sets),
      ),
      workoutType: resolveWorkoutType(
        accessibleExercises.map((exercise) => exercise.muscleGroup),
      ),
      exercises,
    };
  }
}
