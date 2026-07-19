import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { WorkoutSessionsValidationMessages } from '../../../messages/workout-sessions.validation.messages';

export class UpdateSetLogDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: WorkoutSessionsValidationMessages.SET_NUMBER_INVALID })
  @Min(1, { message: WorkoutSessionsValidationMessages.SET_NUMBER_MIN })
  public setNumber?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: WorkoutSessionsValidationMessages.PLANNED_REPS_INVALID })
  @Min(1, { message: WorkoutSessionsValidationMessages.PLANNED_REPS_MIN })
  public plannedReps?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: WorkoutSessionsValidationMessages.PLANNED_WEIGHT_INVALID },
  )
  @Min(0, { message: WorkoutSessionsValidationMessages.PLANNED_WEIGHT_MIN })
  public plannedWeightKg?: number;

  @ApiPropertyOptional({ nullable: true, minimum: 0 })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @Type(() => Number)
  @IsInt({ message: WorkoutSessionsValidationMessages.ACTUAL_REPS_INVALID })
  @Min(0, { message: WorkoutSessionsValidationMessages.ACTUAL_REPS_MIN })
  public actualReps?: number | null;

  @ApiPropertyOptional({ nullable: true, minimum: 0 })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: WorkoutSessionsValidationMessages.ACTUAL_WEIGHT_INVALID },
  )
  @Min(0, { message: WorkoutSessionsValidationMessages.ACTUAL_WEIGHT_MIN })
  public actualWeightKg?: number | null;

  @ApiPropertyOptional({ nullable: true, minimum: 1, maximum: 10 })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 1 },
    { message: WorkoutSessionsValidationMessages.RPE_INVALID },
  )
  @Min(1, { message: WorkoutSessionsValidationMessages.RPE_MIN })
  @Max(10, { message: WorkoutSessionsValidationMessages.RPE_MAX })
  public rpe?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: WorkoutSessionsValidationMessages.IS_WARMUP_INVALID })
  public isWarmup?: boolean;

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsDateString(
    {},
    { message: WorkoutSessionsValidationMessages.COMPLETED_AT_INVALID },
  )
  public completedAt?: string | null;
}
