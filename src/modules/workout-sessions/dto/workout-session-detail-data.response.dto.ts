import { createDataResponseDto } from '@/common/dto';
import { WorkoutSessionDetailResponseDto } from './workout-session-detail.response.dto';

export class WorkoutSessionDetailDataResponseDto extends createDataResponseDto(
  WorkoutSessionDetailResponseDto,
  'WorkoutSessionDetailDataResponseDto',
) {}
