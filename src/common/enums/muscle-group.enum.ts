import type { ValueOf } from '@/common/types';

export const MuscleGroup = {
  LEGS: 'LEGS',
  ARMS: 'ARMS',
  CHEST: 'CHEST',
  BACK: 'BACK',
  SHOULDERS: 'SHOULDERS',
  BICEPS: 'BICEPS',
  TRICEPS: 'TRICEPS',
  ABS: 'ABS',
  FOREARMS: 'FOREARMS',
  CALVES: 'CALVES',
  GLUTES: 'GLUTES',
} as const;

export type MuscleGroup = ValueOf<typeof MuscleGroup>;
