import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty()
  public accessToken!: string;

  @ApiProperty()
  public refreshToken!: string;

  @ApiProperty({ example: 900 })
  public expiresIn!: number;
}
