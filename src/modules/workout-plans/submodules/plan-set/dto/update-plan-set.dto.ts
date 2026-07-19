import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { WorkoutPlansValidationMessages } from '../../../messages/workout-plans.validation.messages';

export class UpdatePlanSetDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.SET_NUMBER_INVALID })
  @Min(1, { message: WorkoutPlansValidationMessages.SET_NUMBER_MIN })
  public setNumber?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.TARGET_REPS_INVALID })
  @Min(1, { message: WorkoutPlansValidationMessages.TARGET_REPS_MIN })
  public targetReps?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: WorkoutPlansValidationMessages.TARGET_WEIGHT_INVALID },
  )
  @Min(0, { message: WorkoutPlansValidationMessages.TARGET_WEIGHT_MIN })
  public targetWeightKg?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.TARGET_REST_INVALID })
  @Min(0, { message: WorkoutPlansValidationMessages.TARGET_REST_MIN })
  public targetRestSec?: number;
}
