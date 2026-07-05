import { DataSource } from 'typeorm';
import { buildTypeormOptions } from './typeorm-options';

export default new DataSource(
  buildTypeormOptions({
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
  }),
);
