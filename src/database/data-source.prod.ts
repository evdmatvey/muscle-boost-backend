import { DataSource } from 'typeorm';
import { buildTypeormOptions } from './typeorm-options';

export default new DataSource(
  buildTypeormOptions({
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/database/migrations/*.js'],
  }),
);
