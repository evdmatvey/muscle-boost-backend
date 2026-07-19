import type { MuscleGroup, SessionStatus, WorkoutType } from '@/common/enums';
import { type IBaseRepository } from '@/common/repositories';
import type { WorkoutSession } from '../entities/workout-session.entity';
import type { SessionExerciseInput } from '../types/session-aggregate.types';

export type FindWorkoutSessionsFilters = {
  userId: string;
  workoutType?: WorkoutType;
  status?: SessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  limit: number;
};

export type WorkoutSessionListRow = WorkoutSession & {
  exercisesCount: number;
};

export type FindWorkoutSessionsResult = {
  items: WorkoutSessionListRow[];
  total: number;
};

export type CreateWorkoutSessionAggregateData = {
  userId: string;
  planId: string | null;
  startedAt: Date;
  status: SessionStatus;
  workoutType: WorkoutType;
  exercises: SessionExerciseInput[];
};

export interface IWorkoutSessionsRepository extends IBaseRepository<WorkoutSession> {
  findOwnedById(userId: string, id: string): Promise<WorkoutSession | null>;
  findOwnedDetail(userId: string, id: string): Promise<WorkoutSession | null>;
  findMany(
    filters: FindWorkoutSessionsFilters,
  ): Promise<FindWorkoutSessionsResult>;
  createAggregate(
    data: CreateWorkoutSessionAggregateData,
  ): Promise<WorkoutSession>;
  updateStartedAt(
    session: WorkoutSession,
    startedAt: Date,
  ): Promise<WorkoutSession>;
  updateStatus(
    sessionId: string,
    status: SessionStatus,
    completedAt?: Date | null,
  ): Promise<WorkoutSession>;
  updateWorkoutType(
    sessionId: string,
    workoutType: WorkoutType,
  ): Promise<WorkoutSession>;
  softDeleteTree(sessionId: string): Promise<void>;
  findMuscleGroupsBySessionId(sessionId: string): Promise<MuscleGroup[]>;
  markInProgressIfPlanned(sessionId: string): Promise<void>;
}

export const WORKOUT_SESSIONS_REPOSITORY = Symbol(
  'WORKOUT_SESSIONS_REPOSITORY',
);
