import { Inject, Injectable } from '@nestjs/common';
import type { WorkoutType } from '@/common/enums';
import { ExercisesService } from '@/modules/exercises';
import type { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutPlanNotFoundException } from './exceptions/workout-plan-not-found.exception';
import type { IWorkoutPlanContext } from './interfaces/workout-plan-context.interface';
import {
  type FindWorkoutPlansResult,
  type IWorkoutPlansRepository,
  WORKOUT_PLANS_REPOSITORY,
} from './repositories/workout-plans.repository.interface';
import type {
  PlanExerciseInput,
  PlanSetInput,
} from './types/plan-aggregate.types';
import {
  assertExercisesAccessible,
  assertUniqueOrderIndexes,
  assertUniqueSetNumbersPerExercise,
} from './utils/assert-plan-exercises.util';
import { resolveWorkoutType } from './utils/resolve-workout-type.util';

export type ListWorkoutPlansParams = {
  workoutType?: WorkoutType;
  search?: string;
  page: number;
  limit: number;
};

export type UpsertPlanExerciseParams = {
  exerciseId: string;
  orderIndex: number;
  notes?: string | null;
  sets: PlanSetInput[];
};

export type UpsertWorkoutPlanParams = {
  name: string;
  notes?: string | null;
  exercises?: UpsertPlanExerciseParams[];
};

export type UpdateWorkoutPlanParams = {
  name?: string;
  notes?: string | null;
};

type PreparedAggregate = {
  notes: string | null;
  workoutType: WorkoutType;
  exercises: PlanExerciseInput[];
};

@Injectable()
export class WorkoutPlansService implements IWorkoutPlanContext {
  public constructor(
    @Inject(WORKOUT_PLANS_REPOSITORY)
    private readonly _workoutPlansRepository: IWorkoutPlansRepository,
    private readonly _exercisesService: ExercisesService,
  ) {}

  public async list(
    userId: string,
    params: ListWorkoutPlansParams,
  ): Promise<FindWorkoutPlansResult> {
    return this._workoutPlansRepository.findMany({
      userId,
      workoutType: params.workoutType,
      search: params.search,
      page: params.page,
      limit: params.limit,
    });
  }

  public async getById(userId: string, id: string): Promise<WorkoutPlan> {
    const plan = await this._workoutPlansRepository.findOwnedDetail(userId, id);

    if (!plan) {
      throw new WorkoutPlanNotFoundException();
    }

    return plan;
  }

  public async create(
    userId: string,
    params: UpsertWorkoutPlanParams,
  ): Promise<WorkoutPlan> {
    const prepared = await this._prepareAggregate(userId, params);

    return this._workoutPlansRepository.createAggregate({
      userId,
      name: params.name,
      notes: prepared.notes,
      workoutType: prepared.workoutType,
      exercises: prepared.exercises,
    });
  }

  public async replace(
    userId: string,
    id: string,
    params: UpsertWorkoutPlanParams,
  ): Promise<WorkoutPlan> {
    await this.getOwnedPlan(userId, id);
    const prepared = await this._prepareAggregate(userId, params);

    return this._workoutPlansRepository.replaceAggregate({
      planId: id,
      name: params.name,
      notes: prepared.notes,
      workoutType: prepared.workoutType,
      exercises: prepared.exercises,
    });
  }

  public async update(
    userId: string,
    id: string,
    params: UpdateWorkoutPlanParams,
  ): Promise<WorkoutPlan> {
    const plan = await this.getOwnedPlan(userId, id);

    await this._workoutPlansRepository.updateMeta(plan, params);

    return this.getById(userId, id);
  }

  public async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedPlan(userId, id);
    await this._workoutPlansRepository.softDeleteTree(id);
  }

  public async getOwnedPlan(userId: string, id: string): Promise<WorkoutPlan> {
    const plan = await this._workoutPlansRepository.findOwnedById(userId, id);

    if (!plan) {
      throw new WorkoutPlanNotFoundException();
    }

    return plan;
  }

  public async recomputeWorkoutType(planId: string): Promise<WorkoutType> {
    const muscleGroups =
      await this._workoutPlansRepository.findMuscleGroupsByPlanId(planId);
    const workoutType = resolveWorkoutType(muscleGroups);

    await this._workoutPlansRepository.updateWorkoutType(planId, workoutType);

    return workoutType;
  }

  private async _prepareAggregate(
    userId: string,
    params: UpsertWorkoutPlanParams,
  ): Promise<PreparedAggregate> {
    const exercises = params.exercises ?? [];

    assertUniqueOrderIndexes(exercises);
    assertUniqueSetNumbersPerExercise(exercises);

    const accessibleExercises = await assertExercisesAccessible(
      this._exercisesService,
      userId,
      exercises.map((exercise) => exercise.exerciseId),
    );

    return {
      notes: params.notes ?? null,
      workoutType: resolveWorkoutType(
        accessibleExercises.map((exercise) => exercise.muscleGroup),
      ),
      exercises: exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        orderIndex: exercise.orderIndex,
        notes: exercise.notes ?? null,
        sets: exercise.sets,
      })),
    };
  }
}
