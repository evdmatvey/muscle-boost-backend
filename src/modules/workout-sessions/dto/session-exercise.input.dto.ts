import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { WorkoutSessionsValidationMessages } from '../messages/workout-sessions.validation.messages';
import { SessionSetInputDto } from './session-set.input.dto';

export class SessionExerciseInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', {
    message: WorkoutSessionsValidationMessages.EXERCISE_ID_INVALID,
  })
  public exerciseId!: string;

  @ApiProperty({ minimum: 0, example: 0 })
  @Type(() => Number)
  @IsInt({ message: WorkoutSessionsValidationMessages.ORDER_INDEX_INVALID })
  @Min(0, { message: WorkoutSessionsValidationMessages.ORDER_INDEX_MIN })
  public orderIndex!: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean({ message: WorkoutSessionsValidationMessages.IS_SKIPPED_INVALID })
  public isSkipped?: boolean;

  @ApiProperty({ type: [SessionSetInputDto] })
  @IsArray({ message: WorkoutSessionsValidationMessages.SETS_INVALID })
  @ArrayMinSize(1, { message: WorkoutSessionsValidationMessages.SETS_MIN })
  @ValidateNested({ each: true })
  @Type(() => SessionSetInputDto)
  public sets!: SessionSetInputDto[];
}
