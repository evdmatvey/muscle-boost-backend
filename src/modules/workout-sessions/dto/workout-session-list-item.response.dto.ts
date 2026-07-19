import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus, WorkoutType } from '@/common/enums';

export class WorkoutSessionListItemResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  public planId!: string | null;

  @ApiProperty()
  public startedAt!: string;

  @ApiPropertyOptional({ nullable: true })
  public completedAt!: string | null;

  @ApiProperty({ enum: SessionStatus })
  public status!: SessionStatus;

  @ApiProperty({ enum: WorkoutType })
  public workoutType!: WorkoutType;

  @ApiProperty({ example: 3 })
  public exercisesCount!: number;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
