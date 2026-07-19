import { createDataResponseDto } from '@/common/dto';
import { WorkoutPlanDetailResponseDto } from './workout-plan-detail.response.dto';

export class WorkoutPlanDetailDataResponseDto extends createDataResponseDto(
  WorkoutPlanDetailResponseDto,
  'WorkoutPlanDetailDataResponseDto',
) {}
