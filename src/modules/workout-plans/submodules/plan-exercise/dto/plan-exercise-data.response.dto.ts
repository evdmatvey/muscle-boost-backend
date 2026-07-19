import { createDataResponseDto } from '@/common/dto';
import { PlanExerciseResponseDto } from '../../../dto/plan-exercise.response.dto';

export class PlanExerciseDataResponseDto extends createDataResponseDto(
  PlanExerciseResponseDto,
  'PlanExerciseDataResponseDto',
) {}
