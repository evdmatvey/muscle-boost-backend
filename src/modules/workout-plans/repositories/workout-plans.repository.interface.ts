import type { MuscleGroup, WorkoutType } from '@/common/enums';
import { type IBaseRepository } from '@/common/repositories';
import type { WorkoutPlan } from '../entities/workout-plan.entity';
import type { PlanExerciseInput } from '../types/plan-aggregate.types';

export type FindWorkoutPlansFilters = {
  userId: string;
  workoutType?: WorkoutType;
  search?: string;
  page: number;
  limit: number;
};

export type WorkoutPlanListRow = WorkoutPlan & {
  exercisesCount: number;
};

export type FindWorkoutPlansResult = {
  items: WorkoutPlanListRow[];
  total: number;
};

export type CreateWorkoutPlanAggregateData = {
  userId: string;
  name: string;
  notes: string | null;
  workoutType: WorkoutType;
  exercises: PlanExerciseInput[];
};

export type ReplaceWorkoutPlanAggregateData = {
  planId: string;
  name: string;
  notes: string | null;
  workoutType: WorkoutType;
  exercises: PlanExerciseInput[];
};

export interface IWorkoutPlansRepository extends IBaseRepository<WorkoutPlan> {
  findOwnedById(userId: string, id: string): Promise<WorkoutPlan | null>;
  findOwnedDetail(userId: string, id: string): Promise<WorkoutPlan | null>;
  findMany(filters: FindWorkoutPlansFilters): Promise<FindWorkoutPlansResult>;
  createAggregate(data: CreateWorkoutPlanAggregateData): Promise<WorkoutPlan>;
  replaceAggregate(data: ReplaceWorkoutPlanAggregateData): Promise<WorkoutPlan>;
  updateMeta(
    plan: WorkoutPlan,
    data: { name?: string; notes?: string | null },
  ): Promise<WorkoutPlan>;
  updateWorkoutType(
    planId: string,
    workoutType: WorkoutType,
  ): Promise<WorkoutPlan>;
  softDeleteTree(planId: string): Promise<void>;
  findMuscleGroupsByPlanId(planId: string): Promise<MuscleGroup[]>;
}

export const WORKOUT_PLANS_REPOSITORY = Symbol('WORKOUT_PLANS_REPOSITORY');
