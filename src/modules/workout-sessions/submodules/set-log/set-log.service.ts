import { Inject, Injectable } from '@nestjs/common';
import { DuplicateSetNumberException } from '../../exceptions/duplicate-set-number.exception';
import { SetLogNotFoundException } from '../../exceptions/set-log-not-found.exception';
import {
  type IWorkoutSessionContext,
  WORKOUT_SESSION_CONTEXT,
} from '../../interfaces/workout-session-context.interface';
import {
  type SetLogFieldsInput,
  hasActualValues,
  resolveSetLogCompletedAtForUpdate,
  resolveSetLogFields,
} from '../../utils/resolve-set-log-fields.util';
import { SessionExerciseService } from '../session-exercise/session-exercise.service';
import type { SetLog } from './entities/set-log.entity';
import {
  type ISetLogsRepository,
  SET_LOGS_REPOSITORY,
} from './repositories/set-logs.repository.interface';

export type CreateSetLogParams = SetLogFieldsInput;

export type UpdateSetLogParams = {
  setNumber?: number;
  plannedReps?: number;
  plannedWeightKg?: number;
  actualReps?: number | null;
  actualWeightKg?: number | null;
  rpe?: number | null;
  isWarmup?: boolean;
  completedAt?: string | null;
};

@Injectable()
export class SetLogService {
  public constructor(
    @Inject(SET_LOGS_REPOSITORY)
    private readonly _setLogsRepository: ISetLogsRepository,
    private readonly _sessionExerciseService: SessionExerciseService,
    @Inject(WORKOUT_SESSION_CONTEXT)
    private readonly _workoutSessionContext: IWorkoutSessionContext,
  ) {}

  public async create(
    userId: string,
    sessionId: string,
    sessionExerciseId: string,
    params: CreateSetLogParams,
  ): Promise<SetLog> {
    await this._workoutSessionContext.assertMutable(userId, sessionId);
    await this._sessionExerciseService.getOwnedSessionExercise(
      userId,
      sessionId,
      sessionExerciseId,
    );

    const setTaken = await this._setLogsRepository.existsSetNumber(
      sessionExerciseId,
      params.setNumber,
    );

    if (setTaken) {
      throw new DuplicateSetNumberException();
    }

    const fields = resolveSetLogFields(params);
    const setLog = await this._setLogsRepository.create({
      sessionExerciseId,
      ...fields,
    });

    if (hasActualValues(setLog.actualReps, setLog.actualWeightKg)) {
      await this._workoutSessionContext.markInProgressIfPlanned(sessionId);
    }

    return setLog;
  }

  public async update(
    userId: string,
    sessionId: string,
    sessionExerciseId: string,
    id: string,
    params: UpdateSetLogParams,
  ): Promise<SetLog> {
    await this._workoutSessionContext.assertMutable(userId, sessionId);

    const setLog = await this._setLogsRepository.findOwnedById(
      userId,
      sessionId,
      sessionExerciseId,
      id,
    );

    if (!setLog) {
      throw new SetLogNotFoundException();
    }

    if (
      params.setNumber !== undefined &&
      params.setNumber !== setLog.setNumber
    ) {
      const setTaken = await this._setLogsRepository.existsSetNumber(
        sessionExerciseId,
        params.setNumber,
        id,
      );

      if (setTaken) {
        throw new DuplicateSetNumberException();
      }
    }

    const completedAt = resolveSetLogCompletedAtForUpdate({
      actualReps: params.actualReps,
      actualWeightKg: params.actualWeightKg,
      completedAt: params.completedAt,
      currentActualReps: setLog.actualReps,
      currentActualWeightKg: setLog.actualWeightKg,
      currentCompletedAt: setLog.completedAt,
    });

    const updated = await this._setLogsRepository.updateMeta(setLog, {
      setNumber: params.setNumber,
      plannedReps: params.plannedReps,
      plannedWeightKg: params.plannedWeightKg,
      actualReps: params.actualReps,
      actualWeightKg: params.actualWeightKg,
      rpe: params.rpe,
      isWarmup: params.isWarmup,
      completedAt,
    });

    if (hasActualValues(updated.actualReps, updated.actualWeightKg)) {
      await this._workoutSessionContext.markInProgressIfPlanned(sessionId);
    }

    return updated;
  }

  public async remove(
    userId: string,
    sessionId: string,
    sessionExerciseId: string,
    id: string,
  ): Promise<void> {
    await this._workoutSessionContext.assertMutable(userId, sessionId);

    const setLog = await this._setLogsRepository.findOwnedById(
      userId,
      sessionId,
      sessionExerciseId,
      id,
    );

    if (!setLog) {
      throw new SetLogNotFoundException();
    }

    await this._setLogsRepository.softDelete(id);
  }
}
