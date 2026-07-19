import { createDataResponseDto } from '@/common/dto';
import { AuthTokensResponseDto } from './auth-tokens.response.dto';

export class AuthTokensDataResponseDto extends createDataResponseDto(
  AuthTokensResponseDto,
  'AuthTokensDataResponseDto',
) {}
