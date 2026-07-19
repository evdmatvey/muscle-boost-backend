import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { WorkoutSessionsValidationMessages } from '../messages/workout-sessions.validation.messages';

export class UpdateWorkoutSessionDto {
  @ApiPropertyOptional({
    format: 'date-time',
    example: '2026-07-19T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: WorkoutSessionsValidationMessages.STARTED_AT_INVALID },
  )
  public startedAt?: string;
}
