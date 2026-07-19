import { createDataResponseDto } from '@/common/dto';
import { SummaryResponseDto } from './summary.response.dto';

export class SummaryDataResponseDto extends createDataResponseDto(
  SummaryResponseDto,
  'SummaryDataResponseDto',
) {}
