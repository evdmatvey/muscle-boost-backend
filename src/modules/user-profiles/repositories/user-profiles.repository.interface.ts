import { type IBaseRepository } from '@/common/repositories';
import type { UserProfile } from '../entities/user-profile.entity';

export type CreateUserProfileData = Pick<UserProfile, 'userId' | 'displayName'>;

export interface IUserProfilesRepository extends IBaseRepository<UserProfile> {
  create(dto: CreateUserProfileData): Promise<UserProfile>;
  findByUserId(userId: string): Promise<UserProfile | null>;
}

export const USER_PROFILES_REPOSITORY = Symbol('USER_PROFILES_REPOSITORY');
