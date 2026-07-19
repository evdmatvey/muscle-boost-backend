import type { ValueOf } from '@/common/types';

export const UserProfilesErrorCode = {
  USER_PROFILE_NOT_FOUND: 'USER_PROFILE_NOT_FOUND',
} as const;

export type UserProfilesErrorCode = ValueOf<typeof UserProfilesErrorCode>;
