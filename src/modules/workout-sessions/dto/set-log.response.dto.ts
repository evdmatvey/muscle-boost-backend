import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetLogResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 1 })
  public setNumber!: number;

  @ApiProperty({ example: 8 })
  public plannedReps!: number;

  @ApiProperty({ example: 60 })
  public plannedWeightKg!: number;

  @ApiPropertyOptional({ nullable: true, example: 8 })
  public actualReps!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 62.5 })
  public actualWeightKg!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 8 })
  public rpe!: number | null;

  @ApiProperty({ example: false })
  public isWarmup!: boolean;

  @ApiPropertyOptional({ nullable: true })
  public completedAt!: string | null;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
