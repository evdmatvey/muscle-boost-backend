import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { WorkoutSessionsValidationMessages } from '../messages/workout-sessions.validation.messages';
import { SessionExerciseInputDto } from './session-exercise.input.dto';

export class CreateWorkoutSessionDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: WorkoutSessionsValidationMessages.PLAN_ID_INVALID })
  public planId?: string;

  @ApiProperty({ format: 'date-time', example: '2026-07-19T10:00:00.000Z' })
  @IsDateString(
    {},
    { message: WorkoutSessionsValidationMessages.STARTED_AT_REQUIRED },
  )
  public startedAt!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean({ message: WorkoutSessionsValidationMessages.START_NOW_INVALID })
  public startNow?: boolean;

  @ApiPropertyOptional({ type: [SessionExerciseInputDto], default: [] })
  @IsOptional()
  @IsArray({ message: WorkoutSessionsValidationMessages.EXERCISES_INVALID })
  @ValidateNested({ each: true })
  @Type(() => SessionExerciseInputDto)
  public exercises?: SessionExerciseInputDto[];
}
