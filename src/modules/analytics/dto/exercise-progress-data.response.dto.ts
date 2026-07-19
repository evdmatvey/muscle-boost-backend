import { createDataResponseDto } from '@/common/dto';
import { ExerciseProgressResponseDto } from './exercise-progress.response.dto';

export class ExerciseProgressDataResponseDto extends createDataResponseDto(
  ExerciseProgressResponseDto,
  'ExerciseProgressDataResponseDto',
) {}
