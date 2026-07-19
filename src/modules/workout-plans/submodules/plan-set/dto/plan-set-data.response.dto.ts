import { createDataResponseDto } from '@/common/dto';
import { PlanSetResponseDto } from '../../../dto/plan-set.response.dto';

export class PlanSetDataResponseDto extends createDataResponseDto(
  PlanSetResponseDto,
  'PlanSetDataResponseDto',
) {}
