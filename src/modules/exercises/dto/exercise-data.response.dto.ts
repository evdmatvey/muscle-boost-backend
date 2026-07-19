import { createDataResponseDto } from '@/common/dto';
import { ExerciseResponseDto } from './exercise.response.dto';

export class ExerciseDataResponseDto extends createDataResponseDto(
  ExerciseResponseDto,
  'ExerciseDataResponseDto',
) {}
