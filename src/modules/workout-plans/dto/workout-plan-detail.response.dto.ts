import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutType } from '@/common/enums';
import { PlanExerciseResponseDto } from './plan-exercise.response.dto';

export class WorkoutPlanDetailResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 'Push Day' })
  public name!: string;

  @ApiPropertyOptional({ nullable: true })
  public notes!: string | null;

  @ApiProperty({ enum: WorkoutType, example: WorkoutType.PUSH })
  public workoutType!: WorkoutType;

  @ApiProperty({ type: [PlanExerciseResponseDto] })
  public exercises!: PlanExerciseResponseDto[];

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
