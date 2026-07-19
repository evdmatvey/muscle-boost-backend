import type { ValueOf } from '@/common/types';

export const ExercisesErrorCode = {
  EXERCISE_NOT_FOUND: 'EXERCISE_NOT_FOUND',
} as const;

export type ExercisesErrorCode = ValueOf<typeof ExercisesErrorCode>;
