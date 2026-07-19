import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateIf } from 'class-validator';
import { UserProfilesValidationMessages } from '../messages/user-profiles.validation.messages';

export class UpdateUserProfileDto {
  @ApiProperty({
    nullable: true,
    maxLength: 100,
    example: 'John',
  })
  @ValidateIf((_, value: unknown) => value !== null)
  @IsString({ message: UserProfilesValidationMessages.DISPLAY_NAME_INVALID })
  @MaxLength(100, {
    message: UserProfilesValidationMessages.DISPLAY_NAME_TOO_LONG,
  })
  public displayName!: string | null;
}
