import { ApiProperty } from '@nestjs/swagger';

export class ExerciseProgressPointResponseDto {
  @ApiProperty({ format: 'date-time' })
  public date!: string;

  @ApiProperty({ example: 80 })
  public maxWeightKg!: number;

  @ApiProperty({ example: 40 })
  public totalReps!: number;

  @ApiProperty({ example: 3200 })
  public volumeKg!: number;

  @ApiProperty({ example: 4 })
  public setsCount!: number;
}
