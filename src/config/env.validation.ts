import { Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  public APP_PORT!: number;

  @IsString()
  @IsNotEmpty()
  public APP_HOST!: string;

  @IsString()
  @IsOptional()
  public ALLOWED_ORIGIN?: string;

  @IsEnum(NodeEnv)
  public NODE_ENV!: NodeEnv;

  @IsString()
  @IsNotEmpty()
  public DB_HOST!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  public DB_PORT!: number;

  @IsString()
  @IsNotEmpty()
  public DB_USER!: string;

  @IsString()
  @IsNotEmpty()
  public DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  public DB_NAME!: string;

  @IsString()
  @IsOptional()
  public JWT_ACCESS_SECRET?: string;

  @IsString()
  @IsOptional()
  public JWT_ACCESS_EXPIRES_IN?: string;

  @IsString()
  @IsOptional()
  public JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  public JWT_REFRESH_EXPIRES_IN?: string;
}

export const validateEnv = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
