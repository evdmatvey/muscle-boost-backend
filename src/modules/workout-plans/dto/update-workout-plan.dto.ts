import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { WorkoutPlansValidationMessages } from '../messages/workout-plans.validation.messages';

export class UpdateWorkoutPlanDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 150 })
  @IsOptional()
  @IsString({ message: WorkoutPlansValidationMessages.NAME_REQUIRED })
  @MinLength(1, { message: WorkoutPlansValidationMessages.NAME_TOO_SHORT })
  @MaxLength(150, { message: WorkoutPlansValidationMessages.NAME_TOO_LONG })
  public name?: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsString({ message: WorkoutPlansValidationMessages.NOTES_INVALID })
  @MaxLength(2000, { message: WorkoutPlansValidationMessages.NOTES_TOO_LONG })
  public notes?: string | null;
}
