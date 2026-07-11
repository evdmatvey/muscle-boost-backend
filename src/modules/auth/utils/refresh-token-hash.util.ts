import { createHash } from 'node:crypto';

export const hashRefreshToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};
