import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { UserProfile } from '../entities/user-profile.entity';
import type {
  CreateUserProfileData,
  IUserProfilesRepository,
} from './user-profiles.repository.interface';

@Injectable()
export class UserProfilesRepository
  extends BaseRepository<UserProfile>
  implements IUserProfilesRepository
{
  public constructor(
    @InjectRepository(UserProfile)
    repository: Repository<UserProfile>,
  ) {
    super(repository);
  }

  public async create(dto: CreateUserProfileData): Promise<UserProfile> {
    const profile = this._repository.create({
      userId: dto.userId,
      displayName: dto.displayName,
    });

    return this._repository.save(profile);
  }

  public async findByUserId(userId: string): Promise<UserProfile | null> {
    return this._repository.findOne({ where: { userId } });
  }
}
