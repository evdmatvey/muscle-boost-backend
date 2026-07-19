import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileDataResponseDto } from './dto/user-profile-data.response.dto';
import { toUserProfileResponse } from './mappers/user-profiles.mapper';
import { UserProfilesService } from './user-profiles.service';

@ApiTags('user-profiles')
@ApiBearerAuth()
@Controller('v1/user-profiles')
export class UserProfilesController {
  public constructor(
    private readonly _userProfilesService: UserProfilesService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserProfileDataResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileDataResponseDto> {
    const { profile, email } = await this._userProfilesService.getMe(
      user.userId,
    );

    return { data: toUserProfileResponse(profile, email) };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserProfileDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  public async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserProfileDataResponseDto> {
    const { profile, email } = await this._userProfilesService.updateMe(
      user.userId,
      dto.displayName,
    );

    return { data: toUserProfileResponse(profile, email) };
  }
}
