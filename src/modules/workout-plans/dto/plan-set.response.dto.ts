import { ApiProperty } from '@nestjs/swagger';

export class PlanSetResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 1 })
  public setNumber!: number;

  @ApiProperty({ example: 8 })
  public targetReps!: number;

  @ApiProperty({ example: 60 })
  public targetWeightKg!: number;

  @ApiProperty({ example: 120 })
  public targetRestSec!: number;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
