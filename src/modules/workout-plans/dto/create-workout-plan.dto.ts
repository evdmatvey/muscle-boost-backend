import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { WorkoutPlansValidationMessages } from '../messages/workout-plans.validation.messages';
import { PlanExerciseInputDto } from './plan-exercise.input.dto';

export class CreateWorkoutPlanDto {
  @ApiProperty({ minLength: 1, maxLength: 150, example: 'Push Day' })
  @IsString({ message: WorkoutPlansValidationMessages.NAME_REQUIRED })
  @MinLength(1, { message: WorkoutPlansValidationMessages.NAME_TOO_SHORT })
  @MaxLength(150, { message: WorkoutPlansValidationMessages.NAME_TOO_LONG })
  public name!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  @ValidateIf((_, value: unknown) => value !== null && value !== undefined)
  @IsString({ message: WorkoutPlansValidationMessages.NOTES_INVALID })
  @MaxLength(2000, { message: WorkoutPlansValidationMessages.NOTES_TOO_LONG })
  public notes?: string | null;

  @ApiPropertyOptional({ type: [PlanExerciseInputDto], default: [] })
  @IsOptional()
  @IsArray({ message: WorkoutPlansValidationMessages.EXERCISES_INVALID })
  @ValidateNested({ each: true })
  @Type(() => PlanExerciseInputDto)
  public exercises?: PlanExerciseInputDto[];
}
