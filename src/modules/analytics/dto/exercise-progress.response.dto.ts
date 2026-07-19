import { ApiProperty } from '@nestjs/swagger';
import { AnalyticsPeriod, MuscleGroup } from '@/common/enums';
import { ExerciseProgressPointResponseDto } from './exercise-progress-point.response.dto';

export class ExerciseProgressResponseDto {
  @ApiProperty({ format: 'uuid' })
  public exerciseId!: string;

  @ApiProperty({ example: 'Жим штанги лёжа' })
  public exerciseName!: string;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.CHEST })
  public muscleGroup!: MuscleGroup;

  @ApiProperty({ enum: AnalyticsPeriod, example: AnalyticsPeriod.MONTH })
  public period!: AnalyticsPeriod;

  @ApiProperty({ format: 'date-time' })
  public dateFrom!: string;

  @ApiProperty({ format: 'date-time' })
  public dateTo!: string;

  @ApiProperty({ type: [ExerciseProgressPointResponseDto] })
  public points!: ExerciseProgressPointResponseDto[];
}
