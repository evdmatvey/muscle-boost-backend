import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 'Chrome / Windows' })
  public deviceName!: string;

  @ApiProperty()
  public lastOnline!: string;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public isCurrent!: boolean;
}
