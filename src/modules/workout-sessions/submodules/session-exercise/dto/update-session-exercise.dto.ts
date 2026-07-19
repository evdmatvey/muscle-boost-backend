import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { WorkoutSessionsValidationMessages } from '../../../messages/workout-sessions.validation.messages';

export class UpdateSessionExerciseDto {
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: WorkoutSessionsValidationMessages.ORDER_INDEX_INVALID })
  @Min(0, { message: WorkoutSessionsValidationMessages.ORDER_INDEX_MIN })
  public orderIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: WorkoutSessionsValidationMessages.IS_SKIPPED_INVALID })
  public isSkipped?: boolean;
}
