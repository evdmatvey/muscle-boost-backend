import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/users';
import type { UserProfile } from './entities/user-profile.entity';
import {
  type IUserProfilesRepository,
  USER_PROFILES_REPOSITORY,
} from './repositories/user-profiles.repository.interface';

export type UserProfileWithEmail = {
  profile: UserProfile;
  email: string;
};

@Injectable()
export class UserProfilesService {
  public constructor(
    @Inject(USER_PROFILES_REPOSITORY)
    private readonly _userProfilesRepository: IUserProfilesRepository,
    private readonly _usersService: UsersService,
  ) {}

  public async createForUser(userId: string): Promise<UserProfile> {
    const existing = await this._userProfilesRepository.findByUserId(userId);

    if (existing) {
      return existing;
    }

    return this._userProfilesRepository.create({
      userId,
      displayName: null,
    });
  }

  public async getMe(userId: string): Promise<UserProfileWithEmail> {
    const user = await this._usersService.getById(userId);
    const profile = await this._getOrCreateProfile(userId);

    return { profile, email: user.email };
  }

  public async updateMe(
    userId: string,
    displayName: string | null,
  ): Promise<UserProfileWithEmail> {
    const user = await this._usersService.getById(userId);
    const profile = await this._getOrCreateProfile(userId);

    profile.displayName = displayName;

    const updatedProfile = await this._userProfilesRepository.save(profile);

    return { profile: updatedProfile, email: user.email };
  }

  private async _getOrCreateProfile(userId: string): Promise<UserProfile> {
    const profile = await this._userProfilesRepository.findByUserId(userId);

    if (profile) {
      return profile;
    }

    return this._userProfilesRepository.create({
      userId,
      displayName: null,
    });
  }
}
