import { Inject, Injectable } from '@nestjs/common';
import { ExercisesService } from '@/modules/exercises';
import { DuplicateOrderIndexException } from '../../exceptions/duplicate-order-index.exception';
import { PlanExerciseNotFoundException } from '../../exceptions/plan-exercise-not-found.exception';
import {
  type IWorkoutPlanContext,
  WORKOUT_PLAN_CONTEXT,
} from '../../interfaces/workout-plan-context.interface';
import type { PlanSetInput } from '../../types/plan-aggregate.types';
import {
  assertExercisesAccessible,
  assertUniqueSetNumbers,
} from '../../utils/assert-plan-exercises.util';
import type { PlanExercise } from './entities/plan-exercise.entity';
import {
  type IPlanExercisesRepository,
  PLAN_EXERCISES_REPOSITORY,
} from './repositories/plan-exercises.repository.interface';

export type CreatePlanExerciseParams = {
  exerciseId: string;
  orderIndex: number;
  notes?: string | null;
  sets: PlanSetInput[];
};

export type UpdatePlanExerciseParams = {
  orderIndex?: number;
  notes?: string | null;
};

@Injectable()
export class PlanExerciseService {
  public constructor(
    @Inject(PLAN_EXERCISES_REPOSITORY)
    private readonly _planExercisesRepository: IPlanExercisesRepository,
    @Inject(WORKOUT_PLAN_CONTEXT)
    private readonly _workoutPlanContext: IWorkoutPlanContext,
    private readonly _exercisesService: ExercisesService,
  ) {}

  public async create(
    userId: string,
    planId: string,
    params: CreatePlanExerciseParams,
  ): Promise<PlanExercise> {
    await this._workoutPlanContext.getOwnedPlan(userId, planId);

    assertUniqueSetNumbers(params.sets);

    const orderTaken = await this._planExercisesRepository.existsOrderIndex(
      planId,
      params.orderIndex,
    );

    if (orderTaken) {
      throw new DuplicateOrderIndexException();
    }

    await assertExercisesAccessible(this._exercisesService, userId, [
      params.exerciseId,
    ]);

    const planExercise = await this._planExercisesRepository.createWithSets({
      planId,
      exerciseId: params.exerciseId,
      orderIndex: params.orderIndex,
      notes: params.notes ?? null,
      sets: params.sets,
    });

    await this._workoutPlanContext.recomputeWorkoutType(planId);

    return planExercise;
  }

  public async update(
    userId: string,
    planId: string,
    id: string,
    params: UpdatePlanExerciseParams,
  ): Promise<PlanExercise> {
    const planExercise = await this._planExercisesRepository.findOwnedById(
      userId,
      planId,
      id,
    );

    if (!planExercise) {
      throw new PlanExerciseNotFoundException();
    }

    if (
      params.orderIndex !== undefined &&
      params.orderIndex !== planExercise.orderIndex
    ) {
      const orderTaken = await this._planExercisesRepository.existsOrderIndex(
        planId,
        params.orderIndex,
        id,
      );

      if (orderTaken) {
        throw new DuplicateOrderIndexException();
      }
    }

    await this._planExercisesRepository.updateMeta(planExercise, params);

    const detail = await this._planExercisesRepository.findOwnedDetail(
      userId,
      planId,
      id,
    );

    if (!detail) {
      throw new PlanExerciseNotFoundException();
    }

    return detail;
  }

  public async remove(
    userId: string,
    planId: string,
    id: string,
  ): Promise<void> {
    const planExercise = await this._planExercisesRepository.findOwnedById(
      userId,
      planId,
      id,
    );

    if (!planExercise) {
      throw new PlanExerciseNotFoundException();
    }

    await this._planExercisesRepository.softDeleteWithSets(id);
    await this._workoutPlanContext.recomputeWorkoutType(planId);
  }

  public async getOwnedPlanExercise(
    userId: string,
    planId: string,
    id: string,
  ): Promise<PlanExercise> {
    const planExercise = await this._planExercisesRepository.findOwnedById(
      userId,
      planId,
      id,
    );

    if (!planExercise) {
      throw new PlanExerciseNotFoundException();
    }

    return planExercise;
  }
}
