import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { buildTypeormOptions } from '@/database/typeorm-options';

export const getDatabaseConfig = (): TypeOrmModuleOptions =>
  buildTypeormOptions({
    autoLoadEntities: true,
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: false,
  });
