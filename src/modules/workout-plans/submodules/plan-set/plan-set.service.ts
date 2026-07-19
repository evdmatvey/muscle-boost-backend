import { Inject, Injectable } from '@nestjs/common';
import { DuplicateSetNumberException } from '../../exceptions/duplicate-set-number.exception';
import { PlanSetNotFoundException } from '../../exceptions/plan-set-not-found.exception';
import { PlanExerciseService } from '../plan-exercise/plan-exercise.service';
import type { PlanSet } from './entities/plan-set.entity';
import {
  type IPlanSetsRepository,
  PLAN_SETS_REPOSITORY,
} from './repositories/plan-sets.repository.interface';

export type CreatePlanSetParams = {
  setNumber: number;
  targetReps: number;
  targetWeightKg: number;
  targetRestSec: number;
};

export type UpdatePlanSetParams = {
  setNumber?: number;
  targetReps?: number;
  targetWeightKg?: number;
  targetRestSec?: number;
};

@Injectable()
export class PlanSetService {
  public constructor(
    @Inject(PLAN_SETS_REPOSITORY)
    private readonly _planSetsRepository: IPlanSetsRepository,
    private readonly _planExerciseService: PlanExerciseService,
  ) {}

  public async create(
    userId: string,
    planId: string,
    planExerciseId: string,
    params: CreatePlanSetParams,
  ): Promise<PlanSet> {
    await this._planExerciseService.getOwnedPlanExercise(
      userId,
      planId,
      planExerciseId,
    );

    const setTaken = await this._planSetsRepository.existsSetNumber(
      planExerciseId,
      params.setNumber,
    );

    if (setTaken) {
      throw new DuplicateSetNumberException();
    }

    return this._planSetsRepository.create({
      planExerciseId,
      ...params,
    });
  }

  public async update(
    userId: string,
    planId: string,
    planExerciseId: string,
    id: string,
    params: UpdatePlanSetParams,
  ): Promise<PlanSet> {
    const planSet = await this._planSetsRepository.findOwnedById(
      userId,
      planId,
      planExerciseId,
      id,
    );

    if (!planSet) {
      throw new PlanSetNotFoundException();
    }

    if (
      params.setNumber !== undefined &&
      params.setNumber !== planSet.setNumber
    ) {
      const setTaken = await this._planSetsRepository.existsSetNumber(
        planExerciseId,
        params.setNumber,
        id,
      );

      if (setTaken) {
        throw new DuplicateSetNumberException();
      }
    }

    return this._planSetsRepository.updateMeta(planSet, params);
  }

  public async remove(
    userId: string,
    planId: string,
    planExerciseId: string,
    id: string,
  ): Promise<void> {
    const planSet = await this._planSetsRepository.findOwnedById(
      userId,
      planId,
      planExerciseId,
      id,
    );

    if (!planSet) {
      throw new PlanSetNotFoundException();
    }

    await this._planSetsRepository.softDelete(id);
  }
}
