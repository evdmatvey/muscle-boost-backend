import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';
import { WorkoutPlansValidationMessages } from '../messages/workout-plans.validation.messages';

export class PlanSetInputDto {
  @ApiProperty({ minimum: 1, example: 1 })
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.SET_NUMBER_INVALID })
  @Min(1, { message: WorkoutPlansValidationMessages.SET_NUMBER_MIN })
  public setNumber!: number;

  @ApiProperty({ minimum: 1, example: 8 })
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.TARGET_REPS_INVALID })
  @Min(1, { message: WorkoutPlansValidationMessages.TARGET_REPS_MIN })
  public targetReps!: number;

  @ApiProperty({ minimum: 0, example: 60 })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: WorkoutPlansValidationMessages.TARGET_WEIGHT_INVALID },
  )
  @Min(0, { message: WorkoutPlansValidationMessages.TARGET_WEIGHT_MIN })
  public targetWeightKg!: number;

  @ApiProperty({ minimum: 0, example: 120 })
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.TARGET_REST_INVALID })
  @Min(0, { message: WorkoutPlansValidationMessages.TARGET_REST_MIN })
  public targetRestSec!: number;
}
