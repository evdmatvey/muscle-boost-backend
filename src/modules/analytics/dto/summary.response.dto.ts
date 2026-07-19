import { ApiProperty } from '@nestjs/swagger';
import { AnalyticsPeriod } from '@/common/enums';
import { SummaryTotalsResponseDto } from './summary-totals.response.dto';
import { TopExerciseResponseDto } from './top-exercise.response.dto';

export class SummaryResponseDto {
  @ApiProperty({ enum: AnalyticsPeriod, example: AnalyticsPeriod.MONTH })
  public period!: AnalyticsPeriod;

  @ApiProperty({ format: 'date-time' })
  public dateFrom!: string;

  @ApiProperty({ format: 'date-time' })
  public dateTo!: string;

  @ApiProperty({ type: SummaryTotalsResponseDto })
  public totals!: SummaryTotalsResponseDto;

  @ApiProperty({ type: [TopExerciseResponseDto] })
  public topExercises!: TopExerciseResponseDto[];
}
