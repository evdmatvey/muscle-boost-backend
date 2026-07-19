import type { WorkoutType } from '@/common/enums';
import type { WorkoutPlan } from '../entities/workout-plan.entity';

export interface IWorkoutPlanContext {
  getOwnedPlan(userId: string, id: string): Promise<WorkoutPlan>;
  recomputeWorkoutType(planId: string): Promise<WorkoutType>;
}

export const WORKOUT_PLAN_CONTEXT = Symbol('WORKOUT_PLAN_CONTEXT');
