import type { ValueOf } from '@/common/types';

export const CommonErrorCode = {
  REQUEST_VALIDATION: 'REQUEST_VALIDATION',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type CommonErrorCode = ValueOf<typeof CommonErrorCode>;
