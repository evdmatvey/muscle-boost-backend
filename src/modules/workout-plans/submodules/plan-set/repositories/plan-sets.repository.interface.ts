import { type IBaseRepository } from '@/common/repositories';
import type { PlanSet } from '../entities/plan-set.entity';

export type CreatePlanSetData = {
  planExerciseId: string;
  setNumber: number;
  targetReps: number;
  targetWeightKg: number;
  targetRestSec: number;
};

export type UpdatePlanSetData = {
  setNumber?: number;
  targetReps?: number;
  targetWeightKg?: number;
  targetRestSec?: number;
};

export interface IPlanSetsRepository extends IBaseRepository<PlanSet> {
  findOwnedById(
    userId: string,
    planId: string,
    planExerciseId: string,
    id: string,
  ): Promise<PlanSet | null>;
  create(data: CreatePlanSetData): Promise<PlanSet>;
  updateMeta(planSet: PlanSet, data: UpdatePlanSetData): Promise<PlanSet>;
  existsSetNumber(
    planExerciseId: string,
    setNumber: number,
    excludeId?: string,
  ): Promise<boolean>;
}

export const PLAN_SETS_REPOSITORY = Symbol('PLAN_SETS_REPOSITORY');
