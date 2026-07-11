import { describe, expect, it } from '@jest/globals';
import 'reflect-metadata';
import { validateEnv } from '../env.validation';

const createValidEnv = (): Record<string, unknown> => ({
  APP_PORT: 3000,
  APP_HOST: 'localhost',
  NODE_ENV: 'development',
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USER: 'muscle_boost',
  DB_PASSWORD: 'muscle_boost',
  DB_NAME: 'muscle_boost',
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_SECRET: 'refresh-secret',
  JWT_REFRESH_EXPIRES_IN: '7d',
  SESSION_LAST_ONLINE_THRESHOLD_MINUTES: 5,
  REFRESH_ROTATION_GRACE_SECONDS: 10,
});

describe('validateEnv', () => {
  it('accepts valid JWT duration formats', () => {
    const env = createValidEnv();

    expect(() => validateEnv(env)).not.toThrow();
    expect(validateEnv(env).JWT_ACCESS_EXPIRES_IN).toBe('15m');
    expect(validateEnv(env).JWT_REFRESH_EXPIRES_IN).toBe('7d');
  });

  it('rejects invalid JWT_ACCESS_EXPIRES_IN format', () => {
    const env = createValidEnv();

    env.JWT_ACCESS_EXPIRES_IN = '15min';

    expect(() => validateEnv(env)).toThrow();
  });

  it('rejects invalid JWT_REFRESH_EXPIRES_IN format', () => {
    const env = createValidEnv();

    env.JWT_REFRESH_EXPIRES_IN = '1week';

    expect(() => validateEnv(env)).toThrow();
  });
});
