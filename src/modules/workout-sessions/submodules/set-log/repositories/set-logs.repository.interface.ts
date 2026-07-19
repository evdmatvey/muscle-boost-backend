import { type IBaseRepository } from '@/common/repositories';
import type { SetLog } from '../entities/set-log.entity';

export type CreateSetLogData = {
  sessionExerciseId: string;
  setNumber: number;
  plannedReps: number;
  plannedWeightKg: number;
  actualReps: number | null;
  actualWeightKg: number | null;
  rpe: number | null;
  isWarmup: boolean;
  completedAt: Date | null;
};

export type UpdateSetLogData = {
  setNumber?: number;
  plannedReps?: number;
  plannedWeightKg?: number;
  actualReps?: number | null;
  actualWeightKg?: number | null;
  rpe?: number | null;
  isWarmup?: boolean;
  completedAt?: Date | null;
};

export interface ISetLogsRepository extends IBaseRepository<SetLog> {
  findOwnedById(
    userId: string,
    sessionId: string,
    sessionExerciseId: string,
    id: string,
  ): Promise<SetLog | null>;
  create(data: CreateSetLogData): Promise<SetLog>;
  updateMeta(setLog: SetLog, data: UpdateSetLogData): Promise<SetLog>;
  existsSetNumber(
    sessionExerciseId: string,
    setNumber: number,
    excludeId?: string,
  ): Promise<boolean>;
}

export const SET_LOGS_REPOSITORY = Symbol('SET_LOGS_REPOSITORY');
