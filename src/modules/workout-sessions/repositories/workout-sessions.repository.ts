import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, In, Repository } from 'typeorm';
import {
  type MuscleGroup,
  SessionStatus,
  type WorkoutType,
} from '@/common/enums';
import { BaseRepository } from '@/common/repositories/base.repository';
import { WorkoutSession } from '../entities/workout-session.entity';
import { WorkoutSessionNotFoundException } from '../exceptions/workout-session-not-found.exception';
import { SessionExercise } from '../submodules/session-exercise/entities/session-exercise.entity';
import { SetLog } from '../submodules/set-log/entities/set-log.entity';
import type { SessionExerciseInput } from '../types/session-aggregate.types';
import type {
  CreateWorkoutSessionAggregateData,
  FindWorkoutSessionsFilters,
  FindWorkoutSessionsResult,
  IWorkoutSessionsRepository,
  WorkoutSessionListRow,
} from './workout-sessions.repository.interface';

@Injectable()
export class WorkoutSessionsRepository
  extends BaseRepository<WorkoutSession>
  implements IWorkoutSessionsRepository
{
  public constructor(
    @InjectRepository(WorkoutSession)
    repository: Repository<WorkoutSession>,
    private readonly _dataSource: DataSource,
  ) {
    super(repository);
  }

  public async findOwnedById(
    userId: string,
    id: string,
  ): Promise<WorkoutSession | null> {
    return this._repository.findOne({
      where: { id, userId },
    });
  }

  public async findOwnedDetail(
    userId: string,
    id: string,
  ): Promise<WorkoutSession | null> {
    return this._repository.findOne({
      where: { id, userId },
      relations: {
        sessionExercises: {
          exercise: true,
          setLogs: true,
        },
      },
      order: {
        sessionExercises: {
          orderIndex: 'ASC',
          setLogs: {
            setNumber: 'ASC',
          },
        },
      },
    });
  }

  public async findMany(
    filters: FindWorkoutSessionsFilters,
  ): Promise<FindWorkoutSessionsResult> {
    const query = this._repository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId: filters.userId });

    if (filters.workoutType) {
      query.andWhere('session.workoutType = :workoutType', {
        workoutType: filters.workoutType,
      });
    }

    if (filters.status) {
      query.andWhere('session.status = :status', { status: filters.status });
    }

    if (filters.dateFrom) {
      query.andWhere('session.startedAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      query.andWhere('session.startedAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    const total = await query.getCount();

    const { entities, raw } = await query
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(se.id)')
          .from(SessionExercise, 'se')
          .where('se.sessionId = session.id')
          .andWhere('se.deletedAt IS NULL');
      }, 'exercisesCount')
      .orderBy('session.startedAt', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getRawAndEntities();

    const items: WorkoutSessionListRow[] = entities.map((session, index) => {
      const row = raw[index] as { exercisesCount?: string | number };

      return Object.assign(session, {
        exercisesCount: Number(row.exercisesCount ?? 0),
      });
    });

    return { items, total };
  }

  public async createAggregate(
    data: CreateWorkoutSessionAggregateData,
  ): Promise<WorkoutSession> {
    return this._dataSource.transaction(async (manager) => {
      const session = manager.create(WorkoutSession, {
        userId: data.userId,
        planId: data.planId,
        startedAt: data.startedAt,
        completedAt: null,
        status: data.status,
        workoutType: data.workoutType,
      });
      const savedSession = await manager.save(session);

      await this._insertExercises(manager, savedSession.id, data.exercises);

      return this._findDetailById(manager, savedSession.id);
    });
  }

  public async updateStartedAt(
    session: WorkoutSession,
    startedAt: Date,
  ): Promise<WorkoutSession> {
    session.startedAt = startedAt;

    return this._repository.save(session);
  }

  public async updateStatus(
    sessionId: string,
    status: SessionStatus,
    completedAt?: Date | null,
  ): Promise<WorkoutSession> {
    const patch: Partial<WorkoutSession> = { status };

    if (completedAt !== undefined) {
      patch.completedAt = completedAt;
    }

    await this._repository.update(sessionId, patch);
    const session = await this._repository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new WorkoutSessionNotFoundException();
    }

    return session;
  }

  public async updateWorkoutType(
    sessionId: string,
    workoutType: WorkoutType,
  ): Promise<WorkoutSession> {
    await this._repository.update(sessionId, { workoutType });
    const session = await this._repository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new WorkoutSessionNotFoundException();
    }

    return session;
  }

  public async softDeleteTree(sessionId: string): Promise<void> {
    await this._dataSource.transaction(async (manager) => {
      await this._softDeleteExercisesTree(manager, sessionId);
      await manager.softDelete(WorkoutSession, sessionId);
    });
  }

  public async findMuscleGroupsBySessionId(
    sessionId: string,
  ): Promise<MuscleGroup[]> {
    const rows = await this._dataSource
      .getRepository(SessionExercise)
      .createQueryBuilder('sessionExercise')
      .innerJoin('sessionExercise.exercise', 'exercise')
      .select('DISTINCT exercise.muscleGroup', 'muscleGroup')
      .where('sessionExercise.sessionId = :sessionId', { sessionId })
      .getRawMany<{ muscleGroup: MuscleGroup }>();

    return rows.map((row) => row.muscleGroup);
  }

  public async markInProgressIfPlanned(sessionId: string): Promise<void> {
    await this._repository.update(
      { id: sessionId, status: SessionStatus.PLANNED },
      { status: SessionStatus.IN_PROGRESS },
    );
  }

  private async _insertExercises(
    manager: EntityManager,
    sessionId: string,
    exercises: SessionExerciseInput[],
  ): Promise<void> {
    for (const exerciseInput of exercises) {
      const sessionExercise = manager.create(SessionExercise, {
        sessionId,
        exerciseId: exerciseInput.exerciseId,
        orderIndex: exerciseInput.orderIndex,
        isSkipped: exerciseInput.isSkipped,
      });
      const savedSessionExercise = await manager.save(sessionExercise);

      const setLogs = exerciseInput.sets.map((setInput) =>
        manager.create(SetLog, {
          sessionExerciseId: savedSessionExercise.id,
          setNumber: setInput.setNumber,
          plannedReps: setInput.plannedReps,
          plannedWeightKg: setInput.plannedWeightKg,
          actualReps: setInput.actualReps,
          actualWeightKg: setInput.actualWeightKg,
          rpe: setInput.rpe,
          isWarmup: setInput.isWarmup,
          completedAt: setInput.completedAt,
        }),
      );

      if (setLogs.length > 0) {
        await manager.save(setLogs);
      }
    }
  }

  private async _softDeleteExercisesTree(
    manager: EntityManager,
    sessionId: string,
  ): Promise<void> {
    const sessionExercises = await manager.find(SessionExercise, {
      where: { sessionId },
      select: { id: true },
    });

    if (sessionExercises.length === 0) {
      return;
    }

    const sessionExerciseIds = sessionExercises.map((item) => item.id);

    await manager.softDelete(SetLog, {
      sessionExerciseId: In(sessionExerciseIds),
    });
    await manager.softDelete(SessionExercise, { sessionId });
  }

  private async _findDetailById(
    manager: EntityManager,
    id: string,
  ): Promise<WorkoutSession> {
    const detail = await manager.findOne(WorkoutSession, {
      where: { id },
      relations: {
        sessionExercises: {
          exercise: true,
          setLogs: true,
        },
      },
      order: {
        sessionExercises: {
          orderIndex: 'ASC',
          setLogs: {
            setNumber: 'ASC',
          },
        },
      },
    });

    if (!detail) {
      throw new WorkoutSessionNotFoundException();
    }

    return detail;
  }
}
