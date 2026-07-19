import type { ValueOf } from '@/common/types';

export const SessionStatus = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type SessionStatus = ValueOf<typeof SessionStatus>;
