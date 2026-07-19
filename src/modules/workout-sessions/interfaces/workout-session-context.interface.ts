import type { WorkoutType } from '@/common/enums';
import type { WorkoutSession } from '../entities/workout-session.entity';

export interface IWorkoutSessionContext {
  getOwnedSession(userId: string, id: string): Promise<WorkoutSession>;
  assertMutable(userId: string, id: string): Promise<WorkoutSession>;
  recomputeWorkoutType(sessionId: string): Promise<WorkoutType>;
  markInProgressIfPlanned(sessionId: string): Promise<void>;
}

export const WORKOUT_SESSION_CONTEXT = Symbol('WORKOUT_SESSION_CONTEXT');
