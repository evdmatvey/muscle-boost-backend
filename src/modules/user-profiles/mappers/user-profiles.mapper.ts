import type { UserProfileResponseDto } from '../dto/user-profile.response.dto';
import type { UserProfile } from '../entities/user-profile.entity';

export const toUserProfileResponse = (
  profile: UserProfile,
  email: string,
): UserProfileResponseDto => {
  return {
    id: profile.id,
    email,
    displayName: profile.displayName,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
};
