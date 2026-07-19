import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@/modules/users';
import { UserProfile } from './entities/user-profile.entity';
import { UserProfilesRepository } from './repositories/user-profiles.repository';
import { USER_PROFILES_REPOSITORY } from './repositories/user-profiles.repository.interface';
import { UserProfilesController } from './user-profiles.controller';
import { UserProfilesService } from './user-profiles.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([UserProfile])],
  controllers: [UserProfilesController],
  providers: [
    UserProfilesRepository,
    {
      provide: USER_PROFILES_REPOSITORY,
      useExisting: UserProfilesRepository,
    },
    UserProfilesService,
  ],
  exports: [UserProfilesService],
})
export class UserProfilesModule {}
