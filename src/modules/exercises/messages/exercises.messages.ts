import { ExercisesErrorCode } from './exercises.error-codes';

export const ExercisesMessages: Record<ExercisesErrorCode, string> = {
  [ExercisesErrorCode.EXERCISE_NOT_FOUND]: 'Упражнение не найдено.',
};
