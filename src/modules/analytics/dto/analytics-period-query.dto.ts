import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AnalyticsPeriod } from '@/common/enums';
import { AnalyticsValidationMessages } from '../messages/analytics.validation.messages';

export class AnalyticsPeriodQueryDto {
  @ApiProperty({ enum: AnalyticsPeriod, example: AnalyticsPeriod.MONTH })
  @IsNotEmpty({ message: AnalyticsValidationMessages.PERIOD_REQUIRED })
  @IsEnum(AnalyticsPeriod, {
    message: AnalyticsValidationMessages.PERIOD_INVALID,
  })
  public period!: AnalyticsPeriod;
}
