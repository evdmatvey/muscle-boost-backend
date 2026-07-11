import type { ValueOf } from '@/common/types';

export const AuthErrorCode = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_ACCESS_TOKEN: 'INVALID_ACCESS_TOKEN',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
} as const;

export type AuthErrorCode = ValueOf<typeof AuthErrorCode>;
