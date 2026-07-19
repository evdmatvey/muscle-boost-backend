import { WorkoutPlansErrorCode } from './workout-plans.error-codes';

export const WorkoutPlansMessages: Record<WorkoutPlansErrorCode, string> = {
  [WorkoutPlansErrorCode.WORKOUT_PLAN_NOT_FOUND]: 'План тренировки не найден.',
  [WorkoutPlansErrorCode.PLAN_EXERCISE_NOT_FOUND]:
    'Упражнение в плане не найдено.',
  [WorkoutPlansErrorCode.PLAN_SET_NOT_FOUND]: 'Подход в плане не найден.',
  [WorkoutPlansErrorCode.EXERCISE_NOT_ACCESSIBLE]:
    'Упражнение недоступно или не найдено.',
  [WorkoutPlansErrorCode.DUPLICATE_ORDER_INDEX]:
    'orderIndex должен быть уникальным в рамках плана.',
  [WorkoutPlansErrorCode.DUPLICATE_SET_NUMBER]:
    'setNumber должен быть уникальным в рамках упражнения.',
};
