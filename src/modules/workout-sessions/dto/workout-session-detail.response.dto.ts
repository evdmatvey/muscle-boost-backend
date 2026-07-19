import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus, WorkoutType } from '@/common/enums';
import { SessionExerciseResponseDto } from './session-exercise.response.dto';

export class WorkoutSessionDetailResponseDto {
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

  @ApiProperty({ type: [SessionExerciseResponseDto] })
  public exercises!: SessionExerciseResponseDto[];

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
