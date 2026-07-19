import { ApiProperty } from '@nestjs/swagger';
import { MuscleGroup } from '@/common/enums';

export class MuscleGroupVolumePointResponseDto {
  @ApiProperty({ format: 'date-time' })
  public periodStart!: string;

  @ApiProperty({ enum: MuscleGroup, example: MuscleGroup.CHEST })
  public muscleGroup!: MuscleGroup;

  @ApiProperty({ example: 12000 })
  public volumeKg!: number;

  @ApiProperty({ example: 24 })
  public setsCount!: number;

  @ApiProperty({ example: 3 })
  public exercisesCount!: number;
}
