import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty()
  public id!: string;

  @ApiProperty({ example: 'user@example.com' })
  public email!: string;

  @ApiProperty({ nullable: true, example: 'John' })
  public displayName!: string | null;

  @ApiProperty()
  public createdAt!: string;

  @ApiProperty()
  public updatedAt!: string;
}
