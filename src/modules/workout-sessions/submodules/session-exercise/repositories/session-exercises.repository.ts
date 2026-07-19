import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Not, Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { SessionExerciseNotFoundException } from '../../../exceptions/session-exercise-not-found.exception';
import { SetLog } from '../../set-log/entities/set-log.entity';
import { SessionExercise } from '../entities/session-exercise.entity';
import type {
  CreateSessionExerciseWithSetsData,
  ISessionExercisesRepository,
} from './session-exercises.repository.interface';

@Injectable()
export class SessionExercisesRepository
  extends BaseRepository<SessionExercise>
  implements ISessionExercisesRepository
{
  public constructor(
    @InjectRepository(SessionExercise)
    repository: Repository<SessionExercise>,
    private readonly _dataSource: DataSource,
  ) {
    super(repository);
  }

  public async findOwnedById(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<SessionExercise | null> {
    return this._repository
      .createQueryBuilder('sessionExercise')
      .innerJoin('sessionExercise.session', 'session')
      .where('sessionExercise.id = :id', { id })
      .andWhere('sessionExercise.sessionId = :sessionId', { sessionId })
      .andWhere('session.userId = :userId', { userId })
      .getOne();
  }

  public async findOwnedDetail(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<SessionExercise | null> {
    return this._repository
      .createQueryBuilder('sessionExercise')
      .innerJoin('sessionExercise.session', 'session')
      .leftJoinAndSelect('sessionExercise.exercise', 'exercise')
      .leftJoinAndSelect('sessionExercise.setLogs', 'setLogs')
      .where('sessionExercise.id = :id', { id })
      .andWhere('sessionExercise.sessionId = :sessionId', { sessionId })
      .andWhere('session.userId = :userId', { userId })
      .orderBy('setLogs.setNumber', 'ASC')
      .getOne();
  }

  public async createWithSets(
    data: CreateSessionExerciseWithSetsData,
  ): Promise<SessionExercise> {
    return this._dataSource.transaction(async (manager) => {
      const sessionExercise = manager.create(SessionExercise, {
        sessionId: data.sessionId,
        exerciseId: data.exerciseId,
        orderIndex: data.orderIndex,
        isSkipped: data.isSkipped,
      });
      const saved = await manager.save(sessionExercise);

      const sets = data.sets.map((set) =>
        manager.create(SetLog, {
          sessionExerciseId: saved.id,
          setNumber: set.setNumber,
          plannedReps: set.plannedReps,
          plannedWeightKg: set.plannedWeightKg,
          actualReps: set.actualReps,
          actualWeightKg: set.actualWeightKg,
          rpe: set.rpe,
          isWarmup: set.isWarmup,
          completedAt: set.completedAt,
        }),
      );

      await manager.save(sets);

      return this._findDetailById(manager, saved.id);
    });
  }

  public async updateMeta(
    sessionExercise: SessionExercise,
    data: { orderIndex?: number; isSkipped?: boolean },
  ): Promise<SessionExercise> {
    if (data.orderIndex !== undefined) {
      sessionExercise.orderIndex = data.orderIndex;
    }

    if (data.isSkipped !== undefined) {
      sessionExercise.isSkipped = data.isSkipped;
    }

    return this._repository.save(sessionExercise);
  }

  public async softDeleteWithSets(id: string): Promise<void> {
    await this._dataSource.transaction(async (manager) => {
      await manager.softDelete(SetLog, { sessionExerciseId: id });
      await manager.softDelete(SessionExercise, id);
    });
  }

  public async existsOrderIndex(
    sessionId: string,
    orderIndex: number,
    excludeId?: string,
  ): Promise<boolean> {
    const where = excludeId
      ? { sessionId, orderIndex, id: Not(excludeId) }
      : { sessionId, orderIndex };

    const count = await this._repository.count({ where });

    return count > 0;
  }

  private async _findDetailById(
    manager: EntityManager,
    id: string,
  ): Promise<SessionExercise> {
    const detail = await manager.findOne(SessionExercise, {
      where: { id },
      relations: {
        exercise: true,
        setLogs: true,
      },
      order: {
        setLogs: {
          setNumber: 'ASC',
        },
      },
    });

    if (!detail) {
      throw new SessionExerciseNotFoundException();
    }

    return detail;
  }
}
