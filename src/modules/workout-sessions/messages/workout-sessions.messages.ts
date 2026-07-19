import { WorkoutSessionsErrorCode } from './workout-sessions.error-codes';

export const WorkoutSessionsMessages: Record<WorkoutSessionsErrorCode, string> =
  {
    [WorkoutSessionsErrorCode.WORKOUT_SESSION_NOT_FOUND]:
      'Тренировка не найдена.',
    [WorkoutSessionsErrorCode.SESSION_EXERCISE_NOT_FOUND]:
      'Упражнение в тренировке не найдено.',
    [WorkoutSessionsErrorCode.SET_LOG_NOT_FOUND]:
      'Подход в тренировке не найден.',
    [WorkoutSessionsErrorCode.EXERCISE_NOT_ACCESSIBLE]:
      'Упражнение недоступно или не найдено.',
    [WorkoutSessionsErrorCode.DUPLICATE_ORDER_INDEX]:
      'orderIndex должен быть уникальным в рамках тренировки.',
    [WorkoutSessionsErrorCode.DUPLICATE_SET_NUMBER]:
      'setNumber должен быть уникальным в рамках упражнения.',
    [WorkoutSessionsErrorCode.SESSION_NOT_MUTABLE]:
      'Тренировка завершена или отменена и недоступна для изменения.',
    [WorkoutSessionsErrorCode.INVALID_SESSION_TRANSITION]:
      'Недопустимый переход статуса тренировки.',
    [WorkoutSessionsErrorCode.INVALID_CREATE_SESSION_PAYLOAD]:
      'Укажите либо planId, либо exercises, но не оба сразу.',
  };
