import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { SetLog } from '../entities/set-log.entity';
import type {
  CreateSetLogData,
  ISetLogsRepository,
  UpdateSetLogData,
} from './set-logs.repository.interface';

@Injectable()
export class SetLogsRepository
  extends BaseRepository<SetLog>
  implements ISetLogsRepository
{
  public constructor(
    @InjectRepository(SetLog)
    repository: Repository<SetLog>,
  ) {
    super(repository);
  }

  public async findOwnedById(
    userId: string,
    sessionId: string,
    sessionExerciseId: string,
    id: string,
  ): Promise<SetLog | null> {
    return this._repository
      .createQueryBuilder('setLog')
      .innerJoin('setLog.sessionExercise', 'sessionExercise')
      .innerJoin('sessionExercise.session', 'session')
      .where('setLog.id = :id', { id })
      .andWhere('setLog.sessionExerciseId = :sessionExerciseId', {
        sessionExerciseId,
      })
      .andWhere('sessionExercise.sessionId = :sessionId', { sessionId })
      .andWhere('session.userId = :userId', { userId })
      .getOne();
  }

  public async create(data: CreateSetLogData): Promise<SetLog> {
    const setLog = this._repository.create({
      sessionExerciseId: data.sessionExerciseId,
      setNumber: data.setNumber,
      plannedReps: data.plannedReps,
      plannedWeightKg: data.plannedWeightKg,
      actualReps: data.actualReps,
      actualWeightKg: data.actualWeightKg,
      rpe: data.rpe,
      isWarmup: data.isWarmup,
      completedAt: data.completedAt,
    });

    return this._repository.save(setLog);
  }

  public async updateMeta(
    setLog: SetLog,
    data: UpdateSetLogData,
  ): Promise<SetLog> {
    if (data.setNumber !== undefined) {
      setLog.setNumber = data.setNumber;
    }

    if (data.plannedReps !== undefined) {
      setLog.plannedReps = data.plannedReps;
    }

    if (data.plannedWeightKg !== undefined) {
      setLog.plannedWeightKg = data.plannedWeightKg;
    }

    if (data.actualReps !== undefined) {
      setLog.actualReps = data.actualReps;
    }

    if (data.actualWeightKg !== undefined) {
      setLog.actualWeightKg = data.actualWeightKg;
    }

    if (data.rpe !== undefined) {
      setLog.rpe = data.rpe;
    }

    if (data.isWarmup !== undefined) {
      setLog.isWarmup = data.isWarmup;
    }

    if (data.completedAt !== undefined) {
      setLog.completedAt = data.completedAt;
    }

    return this._repository.save(setLog);
  }

  public async existsSetNumber(
    sessionExerciseId: string,
    setNumber: number,
    excludeId?: string,
  ): Promise<boolean> {
    const where = excludeId
      ? { sessionExerciseId, setNumber, id: Not(excludeId) }
      : { sessionExerciseId, setNumber };

    const count = await this._repository.count({ where });

    return count > 0;
  }
}
