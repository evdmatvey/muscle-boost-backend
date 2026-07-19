import { Inject, Injectable } from '@nestjs/common';
import { ExercisesService } from '@/modules/exercises';
import { DuplicateOrderIndexException } from '../../exceptions/duplicate-order-index.exception';
import { SessionExerciseNotFoundException } from '../../exceptions/session-exercise-not-found.exception';
import {
  type IWorkoutSessionContext,
  WORKOUT_SESSION_CONTEXT,
} from '../../interfaces/workout-session-context.interface';
import {
  assertExercisesAccessible,
  assertUniqueSetNumbers,
} from '../../utils/assert-session-exercises.util';
import {
  type SetLogFieldsInput,
  resolveSetLogFields,
  setsHaveActuals,
} from '../../utils/resolve-set-log-fields.util';
import type { SessionExercise } from './entities/session-exercise.entity';
import {
  type ISessionExercisesRepository,
  SESSION_EXERCISES_REPOSITORY,
} from './repositories/session-exercises.repository.interface';

export type CreateSessionExerciseParams = {
  exerciseId: string;
  orderIndex: number;
  isSkipped?: boolean;
  sets: SetLogFieldsInput[];
};

export type UpdateSessionExerciseParams = {
  orderIndex?: number;
  isSkipped?: boolean;
};

@Injectable()
export class SessionExerciseService {
  public constructor(
    @Inject(SESSION_EXERCISES_REPOSITORY)
    private readonly _sessionExercisesRepository: ISessionExercisesRepository,
    @Inject(WORKOUT_SESSION_CONTEXT)
    private readonly _workoutSessionContext: IWorkoutSessionContext,
    private readonly _exercisesService: ExercisesService,
  ) {}

  public async create(
    userId: string,
    sessionId: string,
    params: CreateSessionExerciseParams,
  ): Promise<SessionExercise> {
    await this._workoutSessionContext.assertMutable(userId, sessionId);

    assertUniqueSetNumbers(params.sets);

    const orderTaken = await this._sessionExercisesRepository.existsOrderIndex(
      sessionId,
      params.orderIndex,
    );

    if (orderTaken) {
      throw new DuplicateOrderIndexException();
    }

    await assertExercisesAccessible(this._exercisesService, userId, [
      params.exerciseId,
    ]);

    const sets = params.sets.map((set) => resolveSetLogFields(set));

    const sessionExercise =
      await this._sessionExercisesRepository.createWithSets({
        sessionId,
        exerciseId: params.exerciseId,
        orderIndex: params.orderIndex,
        isSkipped: params.isSkipped ?? false,
        sets,
      });

    await this._workoutSessionContext.recomputeWorkoutType(sessionId);

    if (setsHaveActuals(sets)) {
      await this._workoutSessionContext.markInProgressIfPlanned(sessionId);
    }

    return sessionExercise;
  }

  public async update(
    userId: string,
    sessionId: string,
    id: string,
    params: UpdateSessionExerciseParams,
  ): Promise<SessionExercise> {
    await this._workoutSessionContext.assertMutable(userId, sessionId);

    const sessionExercise =
      await this._sessionExercisesRepository.findOwnedById(
        userId,
        sessionId,
        id,
      );

    if (!sessionExercise) {
      throw new SessionExerciseNotFoundException();
    }

    if (
      params.orderIndex !== undefined &&
      params.orderIndex !== sessionExercise.orderIndex
    ) {
      const orderTaken =
        await this._sessionExercisesRepository.existsOrderIndex(
          sessionId,
          params.orderIndex,
          id,
        );

      if (orderTaken) {
        throw new DuplicateOrderIndexException();
      }
    }

    await this._sessionExercisesRepository.updateMeta(sessionExercise, params);

    const detail = await this._sessionExercisesRepository.findOwnedDetail(
      userId,
      sessionId,
      id,
    );

    if (!detail) {
      throw new SessionExerciseNotFoundException();
    }

    return detail;
  }

  public async remove(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<void> {
    await this._workoutSessionContext.assertMutable(userId, sessionId);

    const sessionExercise =
      await this._sessionExercisesRepository.findOwnedById(
        userId,
        sessionId,
        id,
      );

    if (!sessionExercise) {
      throw new SessionExerciseNotFoundException();
    }

    await this._sessionExercisesRepository.softDeleteWithSets(id);
    await this._workoutSessionContext.recomputeWorkoutType(sessionId);
  }

  public async getOwnedSessionExercise(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<SessionExercise> {
    const sessionExercise =
      await this._sessionExercisesRepository.findOwnedById(
        userId,
        sessionId,
        id,
      );

    if (!sessionExercise) {
      throw new SessionExerciseNotFoundException();
    }

    return sessionExercise;
  }
}
