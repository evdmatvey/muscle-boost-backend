import { ApiProperty } from '@nestjs/swagger';
import { SessionExerciseSummaryResponseDto } from './session-exercise-summary.response.dto';
import { SetLogResponseDto } from './set-log.response.dto';

export class SessionExerciseResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 0 })
  public orderIndex!: number;

  @ApiProperty({ example: false })
  public isSkipped!: boolean;

  @ApiProperty({ type: SessionExerciseSummaryResponseDto })
  public exercise!: SessionExerciseSummaryResponseDto;

  @ApiProperty({ type: [SetLogResponseDto] })
  public sets!: SetLogResponseDto[];

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
