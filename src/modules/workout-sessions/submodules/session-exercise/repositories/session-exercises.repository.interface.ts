import { type IBaseRepository } from '@/common/repositories';
import type { SetLogInput } from '../../../types/session-aggregate.types';
import type { SessionExercise } from '../entities/session-exercise.entity';

export type CreateSessionExerciseWithSetsData = {
  sessionId: string;
  exerciseId: string;
  orderIndex: number;
  isSkipped: boolean;
  sets: SetLogInput[];
};

export interface ISessionExercisesRepository extends IBaseRepository<SessionExercise> {
  findOwnedById(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<SessionExercise | null>;
  findOwnedDetail(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<SessionExercise | null>;
  createWithSets(
    data: CreateSessionExerciseWithSetsData,
  ): Promise<SessionExercise>;
  updateMeta(
    sessionExercise: SessionExercise,
    data: { orderIndex?: number; isSkipped?: boolean },
  ): Promise<SessionExercise>;
  softDeleteWithSets(id: string): Promise<void>;
  existsOrderIndex(
    sessionId: string,
    orderIndex: number,
    excludeId?: string,
  ): Promise<boolean>;
}

export const SESSION_EXERCISES_REPOSITORY = Symbol(
  'SESSION_EXERCISES_REPOSITORY',
);
