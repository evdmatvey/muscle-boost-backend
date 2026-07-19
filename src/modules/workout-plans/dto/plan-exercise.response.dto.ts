import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanExerciseSummaryResponseDto } from './plan-exercise-summary.response.dto';
import { PlanSetResponseDto } from './plan-set.response.dto';

export class PlanExerciseResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 0 })
  public orderIndex!: number;

  @ApiPropertyOptional({ nullable: true })
  public notes!: string | null;

  @ApiProperty({ type: PlanExerciseSummaryResponseDto })
  public exercise!: PlanExerciseSummaryResponseDto;

  @ApiProperty({ type: [PlanSetResponseDto] })
  public sets!: PlanSetResponseDto[];

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
