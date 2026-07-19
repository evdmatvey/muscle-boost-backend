import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkoutType } from '@/common/enums';

export class WorkoutPlanListItemResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 'Push Day' })
  public name!: string;

  @ApiPropertyOptional({ nullable: true })
  public notes!: string | null;

  @ApiProperty({ enum: WorkoutType, example: WorkoutType.PUSH })
  public workoutType!: WorkoutType;

  @ApiProperty({ example: 3 })
  public exercisesCount!: number;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
