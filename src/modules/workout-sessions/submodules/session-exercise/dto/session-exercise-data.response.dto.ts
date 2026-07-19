import { createDataResponseDto } from '@/common/dto';
import { SessionExerciseResponseDto } from '../../../dto/session-exercise.response.dto';

export class SessionExerciseDataResponseDto extends createDataResponseDto(
  SessionExerciseResponseDto,
  'SessionExerciseDataResponseDto',
) {}
