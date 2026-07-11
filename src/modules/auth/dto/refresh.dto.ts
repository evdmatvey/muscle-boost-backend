import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthValidationMessages } from '../messages/auth.validation.messages';

export class RefreshDto {
  @ApiProperty()
  @IsString({ message: AuthValidationMessages.REFRESH_TOKEN_INVALID })
  @IsNotEmpty({ message: AuthValidationMessages.REFRESH_TOKEN_REQUIRED })
  public refreshToken!: string;
}
