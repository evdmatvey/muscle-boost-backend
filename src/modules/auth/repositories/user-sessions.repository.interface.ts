import { type IBaseRepository } from '@/common/repositories';
import type { UserSession } from '../entities/user-session.entity';

export type CreateUserSessionData = Pick<
  UserSession,
  'userId' | 'refreshTokenHash' | 'deviceName' | 'lastOnline' | 'expiresAt'
>;

export type RotateRefreshTokenParams = {
  sessionId: string;
  userId: string;
  expectedHash: string;
  newHash: string;
  lastOnline: Date;
  expiresAt: Date;
};

export interface IUserSessionsRepository extends IBaseRepository<UserSession> {
  create(data: CreateUserSessionData): Promise<UserSession>;
  findActiveById(id: string): Promise<UserSession | null>;
  findActiveByUserId(userId: string): Promise<UserSession[]>;
  rotateRefreshTokenIfMatches(
    params: RotateRefreshTokenParams,
  ): Promise<boolean>;
  revokeById(id: string): Promise<void>;
  revokeAllExcept(userId: string, sessionId: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
  touchLastOnlineIfStale(sessionId: string, staleBefore: Date): Promise<void>;
}

export const USER_SESSIONS_REPOSITORY = Symbol('USER_SESSIONS_REPOSITORY');
