import { ApiProperty } from '@nestjs/swagger';
import { AnalyticsPeriod } from '@/common/enums';
import {
  ANALYTICS_MUSCLE_GROUP_GRANULARITY,
  AnalyticsGranularity,
} from '../enums/analytics-granularity.enum';
import { MuscleGroupVolumePointResponseDto } from './muscle-group-volume-point.response.dto';

export class MuscleGroupVolumeResponseDto {
  @ApiProperty({ enum: AnalyticsPeriod, example: AnalyticsPeriod.MONTH })
  public period!: AnalyticsPeriod;

  @ApiProperty({ format: 'date-time' })
  public dateFrom!: string;

  @ApiProperty({ format: 'date-time' })
  public dateTo!: string;

  @ApiProperty({
    enum: AnalyticsGranularity,
    example: ANALYTICS_MUSCLE_GROUP_GRANULARITY,
  })
  public granularity!: AnalyticsGranularity;

  @ApiProperty({ type: [MuscleGroupVolumePointResponseDto] })
  public points!: MuscleGroupVolumePointResponseDto[];
}
