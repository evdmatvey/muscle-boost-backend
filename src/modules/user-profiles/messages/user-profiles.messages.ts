import { UserProfilesErrorCode } from './user-profiles.error-codes';

export const UserProfilesMessages: Record<UserProfilesErrorCode, string> = {
  [UserProfilesErrorCode.USER_PROFILE_NOT_FOUND]:
    'Профиль пользователя не найден.',
};
