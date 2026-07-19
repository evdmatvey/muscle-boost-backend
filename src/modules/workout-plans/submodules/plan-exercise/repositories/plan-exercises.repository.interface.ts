import { type IBaseRepository } from '@/common/repositories';
import type { PlanExercise } from '../entities/plan-exercise.entity';

export type CreatePlanExerciseData = {
  planId: string;
  exerciseId: string;
  orderIndex: number;
  notes: string | null;
};

export type CreatePlanSetData = {
  setNumber: number;
  targetReps: number;
  targetWeightKg: number;
  targetRestSec: number;
};

export type CreatePlanExerciseWithSetsData = CreatePlanExerciseData & {
  sets: CreatePlanSetData[];
};

export interface IPlanExercisesRepository extends IBaseRepository<PlanExercise> {
  findOwnedById(
    userId: string,
    planId: string,
    id: string,
  ): Promise<PlanExercise | null>;
  findOwnedDetail(
    userId: string,
    planId: string,
    id: string,
  ): Promise<PlanExercise | null>;
  createWithSets(data: CreatePlanExerciseWithSetsData): Promise<PlanExercise>;
  updateMeta(
    planExercise: PlanExercise,
    data: { orderIndex?: number; notes?: string | null },
  ): Promise<PlanExercise>;
  softDeleteWithSets(id: string): Promise<void>;
  existsOrderIndex(
    planId: string,
    orderIndex: number,
    excludeId?: string,
  ): Promise<boolean>;
}

export const PLAN_EXERCISES_REPOSITORY = Symbol('PLAN_EXERCISES_REPOSITORY');
