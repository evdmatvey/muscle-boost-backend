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
import { IsDuration } from '@/common/validators/is-duration.validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class DatabaseEnvironmentVariables {
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
}

export class EnvironmentVariables extends DatabaseEnvironmentVariables {
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
  public JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  @IsDuration()
  public JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  public JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  @IsDuration()
  public JWT_REFRESH_EXPIRES_IN!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  public SESSION_LAST_ONLINE_THRESHOLD_MINUTES!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  public REFRESH_ROTATION_GRACE_SECONDS!: number;
}

const throwValidationErrors = (
  errors: ReturnType<typeof validateSync>,
): void => {
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
};

export const validateDbEnv = (
  config: Record<string, unknown>,
): DatabaseEnvironmentVariables => {
  const validatedConfig = plainToInstance(
    DatabaseEnvironmentVariables,
    config,
    {
      enableImplicitConversion: true,
    },
  );

  throwValidationErrors(validateSync(validatedConfig));

  return validatedConfig;
};

export const validateEnv = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  throwValidationErrors(
    validateSync(validatedConfig, {
      skipMissingProperties: false,
    }),
  );

  return validatedConfig;
};
