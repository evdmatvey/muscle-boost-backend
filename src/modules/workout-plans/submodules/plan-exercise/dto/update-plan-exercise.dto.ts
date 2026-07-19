import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { WorkoutPlansValidationMessages } from '../../../messages/workout-plans.validation.messages';

export class UpdatePlanExerciseDto {
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: WorkoutPlansValidationMessages.ORDER_INDEX_INVALID })
  @Min(0, { message: WorkoutPlansValidationMessages.ORDER_INDEX_MIN })
  public orderIndex?: number;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsString({ message: WorkoutPlansValidationMessages.NOTES_INVALID })
  @MaxLength(2000, { message: WorkoutPlansValidationMessages.NOTES_TOO_LONG })
  public notes?: string | null;
}
