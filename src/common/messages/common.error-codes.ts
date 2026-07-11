import type { ValueOf } from '@/common/types';

export const CommonErrorCode = {
  REQUEST_VALIDATION: 'REQUEST_VALIDATION',
} as const;

export type CommonErrorCode = ValueOf<typeof CommonErrorCode>;
