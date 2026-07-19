import { createDataResponseDto } from '@/common/dto';
import { SetLogResponseDto } from '../../../dto/set-log.response.dto';

export class SetLogDataResponseDto extends createDataResponseDto(
  SetLogResponseDto,
  'SetLogDataResponseDto',
) {}
