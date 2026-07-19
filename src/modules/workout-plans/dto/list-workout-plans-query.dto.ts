import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto';
import { WorkoutType } from '@/common/enums';
import { WorkoutPlansValidationMessages } from '../messages/workout-plans.validation.messages';

export class ListWorkoutPlansQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: WorkoutType })
  @IsOptional()
  @IsEnum(WorkoutType, {
    message: WorkoutPlansValidationMessages.WORKOUT_TYPE_INVALID,
  })
  public workoutType?: WorkoutType;

  @ApiPropertyOptional({ maxLength: 100, example: 'push' })
  @IsOptional()
  @IsString({ message: WorkoutPlansValidationMessages.SEARCH_INVALID })
  @MaxLength(100, { message: WorkoutPlansValidationMessages.SEARCH_TOO_LONG })
  public search?: string;
}
