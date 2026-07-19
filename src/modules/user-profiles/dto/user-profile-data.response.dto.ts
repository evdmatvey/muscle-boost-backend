import { createDataResponseDto } from '@/common/dto';
import { UserProfileResponseDto } from './user-profile.response.dto';

export class UserProfileDataResponseDto extends createDataResponseDto(
  UserProfileResponseDto,
  'UserProfileDataResponseDto',
) {}
