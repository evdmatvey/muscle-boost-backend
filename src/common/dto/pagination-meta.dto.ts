import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  public page!: number;

  @ApiProperty({ example: 20 })
  public limit!: number;

  @ApiProperty({ example: 37 })
  public total!: number;
}
