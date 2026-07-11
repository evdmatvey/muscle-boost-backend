import type { ValueOf } from '@/common/types';

export const UsersErrorCode = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_IN_USE: 'EMAIL_ALREADY_IN_USE',
} as const;

export type UsersErrorCode = ValueOf<typeof UsersErrorCode>;
