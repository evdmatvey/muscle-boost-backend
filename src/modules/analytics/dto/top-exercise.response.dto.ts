import { ApiProperty } from '@nestjs/swagger';
import { MuscleGroup } from '@/common/enums';

export class TopExerciseResponseDto {
  @ApiProperty({ format: 'uuid' })
  public exerciseId!: string;

  @ApiProperty({ example: 'Жим штанги лёжа' })
  public name!: string;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.CHEST })
  public muscleGroup!: MuscleGroup;

  @ApiProperty({ example: 8 })
  public sessionsCount!: number;
}
