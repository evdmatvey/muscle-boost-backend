import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import type { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  type EnvironmentVariables,
  validateEnv,
} from '@/config/env.validation';

export type DBEnv = Pick<
  EnvironmentVariables,
  'DB_HOST' | 'DB_PORT' | 'DB_USER' | 'DB_PASSWORD' | 'DB_NAME'
>;

type TypeOrmDataSourceOptions = Partial<
  Omit<
    DataSourceOptions,
    | 'type'
    | 'host'
    | 'port'
    | 'username'
    | 'password'
    | 'database'
    | 'synchronize'
    | 'namingStrategy'
  >
>;
type TypeOrmDataSourceModuleOptions = Partial<
  Pick<TypeOrmModuleOptions, 'autoLoadEntities' | 'migrationsRun'>
>;

type TypeOrmAdditionalOptions = TypeOrmDataSourceOptions &
  TypeOrmDataSourceModuleOptions;

const pickDBEnv = (env: Pick<EnvironmentVariables, keyof DBEnv>): DBEnv => {
  return {
    DB_HOST: env.DB_HOST,
    DB_PORT: env.DB_PORT,
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD,
    DB_NAME: env.DB_NAME,
  };
};

const loadValidatedDBEnv = (): DBEnv => {
  config();

  const env = validateEnv(process.env);

  return pickDBEnv(env);
};

export const buildTypeormOptions = (
  additionalOptions: TypeOrmAdditionalOptions = {},
): DataSourceOptions => {
  const db = loadValidatedDBEnv();

  return {
    ...additionalOptions,
    type: 'postgres',
    host: db.DB_HOST,
    port: db.DB_PORT,
    username: db.DB_USER,
    password: db.DB_PASSWORD,
    database: db.DB_NAME,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
  };
};
