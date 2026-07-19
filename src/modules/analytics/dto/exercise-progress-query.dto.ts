import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { AnalyticsValidationMessages } from '../messages/analytics.validation.messages';
import { AnalyticsPeriodQueryDto } from './analytics-period-query.dto';

export class ExerciseProgressQueryDto extends AnalyticsPeriodQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty({ message: AnalyticsValidationMessages.EXERCISE_ID_REQUIRED })
  @IsUUID('4', {
    message: AnalyticsValidationMessages.EXERCISE_ID_INVALID,
  })
  public exerciseId!: string;
}
