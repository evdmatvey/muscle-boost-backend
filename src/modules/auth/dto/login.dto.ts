import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { AuthValidationMessages } from '../messages/auth.validation.messages';
import { IsStrongPassword } from '../validators/is-strong-password.validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: AuthValidationMessages.EMAIL_INVALID })
  public email!: string;

  @ApiProperty({ example: 'Abcd1234!' })
  @IsString({ message: AuthValidationMessages.PASSWORD_REQUIRED })
  @IsStrongPassword()
  public password!: string;
}
