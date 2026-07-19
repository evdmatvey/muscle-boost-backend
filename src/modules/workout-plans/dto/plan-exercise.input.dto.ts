import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { WorkoutPlansValidationMessages } from '../messages/workout-plans.validation.messages';
import { PlanSetInputDto } from './plan-set.input.dto';

export class PlanExerciseInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: WorkoutPlansValidationMessages.EXERCISE_ID_INVALID })
  public exerciseId!: string;

  @ApiProperty({ minimum: 0, example: 0 })
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.ORDER_INDEX_INVALID })
  @Min(0, { message: WorkoutPlansValidationMessages.ORDER_INDEX_MIN })
  public orderIndex!: number;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  @ValidateIf((_, value: unknown) => value !== null && value !== undefined)
  @IsString({ message: WorkoutPlansValidationMessages.NOTES_INVALID })
  @MaxLength(2000, { message: WorkoutPlansValidationMessages.NOTES_TOO_LONG })
  public notes?: string | null;

  @ApiProperty({ type: [PlanSetInputDto] })
  @IsArray({ message: WorkoutPlansValidationMessages.SETS_INVALID })
  @ArrayMinSize(1, { message: WorkoutPlansValidationMessages.SETS_MIN })
  @ValidateNested({ each: true })
  @Type(() => PlanSetInputDto)
  public sets!: PlanSetInputDto[];
}
