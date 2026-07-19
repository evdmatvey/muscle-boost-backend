import { ApiProperty } from '@nestjs/swagger';

export class SummaryTotalsResponseDto {
  @ApiProperty({ example: 12 })
  public workoutsCount!: number;

  @ApiProperty({ example: 180 })
  public setsCount!: number;

  @ApiProperty({ example: 2100 })
  public repsCount!: number;

  @ApiProperty({ example: 45000 })
  public volumeKg!: number;
}
