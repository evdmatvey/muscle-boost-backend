import type { ValueOf } from '@/common/types';

export const ExerciseSource = {
  ALL: 'ALL',
  CATALOG: 'CATALOG',
  CUSTOM: 'CUSTOM',
} as const;

export type ExerciseSource = ValueOf<typeof ExerciseSource>;
