import { createDataArrayResponseDto } from '@/common/dto';
import { SessionResponseDto } from './session.response.dto';

export class SessionsDataResponseDto extends createDataArrayResponseDto(
  SessionResponseDto,
  'SessionsDataResponseDto',
) {}
