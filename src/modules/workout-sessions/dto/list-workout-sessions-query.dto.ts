import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto';
import { SessionStatus, WorkoutType } from '@/common/enums';
import { WorkoutSessionsValidationMessages } from '../messages/workout-sessions.validation.messages';

export class ListWorkoutSessionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: WorkoutType })
  @IsOptional()
  @IsEnum(WorkoutType, {
    message: WorkoutSessionsValidationMessages.WORKOUT_TYPE_INVALID,
  })
  public workoutType?: WorkoutType;

  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus, {
    message: WorkoutSessionsValidationMessages.STATUS_INVALID,
  })
  public status?: SessionStatus;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString(
    {},
    { message: WorkoutSessionsValidationMessages.DATE_FROM_INVALID },
  )
  public dateFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString(
    {},
    { message: WorkoutSessionsValidationMessages.DATE_TO_INVALID },
  )
  public dateTo?: string;
}
