import type { PlanExerciseResponseDto } from '../dto/plan-exercise.response.dto';
import type { PlanSetResponseDto } from '../dto/plan-set.response.dto';
import type { WorkoutPlanDetailResponseDto } from '../dto/workout-plan-detail.response.dto';
import type { WorkoutPlanListItemResponseDto } from '../dto/workout-plan-list-item.response.dto';
import type { WorkoutPlan } from '../entities/workout-plan.entity';
import type { WorkoutPlanListRow } from '../repositories/workout-plans.repository.interface';
import type { PlanExercise } from '../submodules/plan-exercise/entities/plan-exercise.entity';
import type { PlanSet } from '../submodules/plan-set/entities/plan-set.entity';

export const toPlanSetResponse = (planSet: PlanSet): PlanSetResponseDto => {
  return {
    id: planSet.id,
    setNumber: planSet.setNumber,
    targetReps: planSet.targetReps,
    targetWeightKg: planSet.targetWeightKg,
    targetRestSec: planSet.targetRestSec,
    createdAt: planSet.createdAt.toISOString(),
    updatedAt: planSet.updatedAt.toISOString(),
  };
};

export const toPlanExerciseResponse = (
  planExercise: PlanExercise,
): PlanExerciseResponseDto => {
  const exercise = planExercise.exercise;

  if (!exercise) {
    throw new Error('Plan exercise must include exercise relation');
  }

  return {
    id: planExercise.id,
    orderIndex: planExercise.orderIndex,
    notes: planExercise.notes,
    exercise: {
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
    },
    sets: (planExercise.planSets ?? [])
      .slice()
      .sort((left, right) => left.setNumber - right.setNumber)
      .map(toPlanSetResponse),
    createdAt: planExercise.createdAt.toISOString(),
    updatedAt: planExercise.updatedAt.toISOString(),
  };
};

export const toWorkoutPlanListItemResponse = (
  plan: WorkoutPlanListRow,
): WorkoutPlanListItemResponseDto => {
  return {
    id: plan.id,
    name: plan.name,
    notes: plan.notes,
    workoutType: plan.workoutType,
    exercisesCount: plan.exercisesCount,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
};

export const toWorkoutPlanDetailResponse = (
  plan: WorkoutPlan,
): WorkoutPlanDetailResponseDto => {
  return {
    id: plan.id,
    name: plan.name,
    notes: plan.notes,
    workoutType: plan.workoutType,
    exercises: (plan.planExercises ?? [])
      .slice()
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map(toPlanExerciseResponse),
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
};
