import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test as NestTest, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TokenExpiredError } from 'jsonwebtoken';
import { UserNotFoundException, UsersService } from '@/modules/users';
import { AuthService } from '../auth.service';
import type { UserSession } from '../entities/user-session.entity';
import { AuthErrorCode } from '../messages/auth.error-codes';
import {
  type IUserSessionsRepository,
  USER_SESSIONS_REPOSITORY,
} from '../repositories/user-sessions.repository.interface';
import * as passwordUtil from '../utils/password.util';
import * as refreshTokenHashUtil from '../utils/refresh-token-hash.util';

jest.mock('../utils/password.util');
jest.mock('../utils/refresh-token-hash.util');

const createUserFixture = () => ({
  id: 'user-id',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
});

const createSessionFixture = (
  overrides: Partial<UserSession> = {},
): UserSession => ({
  id: 'session-id',
  userId: 'user-id',
  refreshTokenHash: 'refresh-hash',
  deviceName: 'Chrome / Windows',
  lastOnline: new Date('2026-07-10T00:00:00.000Z'),
  expiresAt: new Date('2026-07-17T00:00:00.000Z'),
  revokedAt: null,
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  updatedAt: new Date('2026-07-10T00:00:00.000Z'),
  deletedAt: null,
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'create' | 'getByEmail'>>;
  let userSessionsRepository: jest.Mocked<
    Pick<
      IUserSessionsRepository,
      | 'create'
      | 'save'
      | 'findActiveById'
      | 'findActiveByUserId'
      | 'revokeById'
      | 'revokeAllExcept'
      | 'revokeAllByUserId'
      | 'rotateRefreshTokenIfMatches'
      | 'touchLastOnlineIfStale'
    >
  >;
  let jwtService: {
    signAsync: jest.Mock<() => Promise<string>>;
    verifyAsync: jest.Mock<
      () => Promise<{ sub: string; sid: string; type: string }>
    >;
  };
  let configService: {
    getOrThrow: jest.Mock<(key: string) => string | number>;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      getByEmail: jest.fn(),
    };

    userSessionsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findActiveById: jest.fn(),
      findActiveByUserId: jest.fn(),
      revokeById: jest.fn(),
      revokeAllExcept: jest.fn(),
      revokeAllByUserId: jest.fn(),
      rotateRefreshTokenIfMatches: jest.fn(),
      touchLastOnlineIfStale: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn<() => Promise<string>>(),
      verifyAsync:
        jest.fn<() => Promise<{ sub: string; sid: string; type: string }>>(),
    };

    configService = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string | number> = {
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_ACCESS_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
          SESSION_LAST_ONLINE_THRESHOLD_MINUTES: 5,
          REFRESH_ROTATION_GRACE_SECONDS: 10,
        };

        const value = values[key];

        if (value === undefined) {
          throw new Error(`Missing config key: ${key}`);
        }

        return value;
      }),
    };

    const module: TestingModule = await NestTest.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: USER_SESSIONS_REPOSITORY,
          useValue: userSessionsRepository,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(AuthService);

    jest
      .spyOn(passwordUtil, 'hashPassword')
      .mockResolvedValue('hashed-password');
    jest.spyOn(passwordUtil, 'verifyPassword').mockResolvedValue(true);
    jest
      .spyOn(refreshTokenHashUtil, 'hashRefreshToken')
      .mockReturnValue('refresh-hash');
  });

  describe('register', () => {
    it('creates user and returns tokens', async () => {
      const user = createUserFixture();
      const session = createSessionFixture({ refreshTokenHash: '' });

      usersService.create.mockResolvedValue(user);
      userSessionsRepository.create.mockResolvedValue(session);
      userSessionsRepository.save.mockResolvedValue(
        createSessionFixture({ refreshTokenHash: 'refresh-hash' }),
      );
      jwtService.signAsync
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce('access-token');

      await expect(
        service.register('test@example.com', 'Abcd1234!', 'Mozilla/5.0'),
      ).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      expect(userSessionsRepository.create).toHaveBeenCalled();
      expect(userSessionsRepository.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const user = createUserFixture();
      const session = createSessionFixture({ refreshTokenHash: '' });

      usersService.getByEmail.mockResolvedValue(user);
      userSessionsRepository.create.mockResolvedValue(session);
      userSessionsRepository.save.mockResolvedValue(
        createSessionFixture({ refreshTokenHash: 'refresh-hash' }),
      );
      jwtService.signAsync
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce('access-token');

      await expect(
        service.login('test@example.com', 'Abcd1234!', 'Mozilla/5.0'),
      ).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
    });

    it('throws InvalidCredentialsException when user is not found', async () => {
      usersService.getByEmail.mockRejectedValue(new UserNotFoundException());

      await expect(
        service.login('missing@example.com', 'Abcd1234!', 'Mozilla/5.0'),
      ).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_CREDENTIALS,
      });
    });

    it('throws InvalidCredentialsException when password is invalid', async () => {
      const user = createUserFixture();

      usersService.getByEmail.mockResolvedValue(user);
      jest.spyOn(passwordUtil, 'verifyPassword').mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrong-password', 'Mozilla/5.0'),
      ).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_CREDENTIALS,
      });
    });
  });

  describe('refresh', () => {
    it('rotates refresh token for valid session', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        sid: 'session-id',
        type: 'refresh',
      });
      userSessionsRepository.rotateRefreshTokenIfMatches.mockResolvedValue(
        true,
      );
      jwtService.signAsync
        .mockResolvedValueOnce('new-refresh-token')
        .mockResolvedValueOnce('new-access-token');

      await expect(service.refresh('refresh-token')).resolves.toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });

      expect(
        userSessionsRepository.rotateRefreshTokenIfMatches,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-id',
          userId: 'user-id',
          expectedHash: 'refresh-hash',
          newHash: 'refresh-hash',
        }),
      );
      expect(userSessionsRepository.save).not.toHaveBeenCalled();
    });

    it('retries rotation when first CAS fails but hash still matches', async () => {
      const session = createSessionFixture({
        refreshTokenHash: 'refresh-hash',
      });

      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        sid: 'session-id',
        type: 'refresh',
      });
      userSessionsRepository.rotateRefreshTokenIfMatches
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      userSessionsRepository.findActiveById.mockResolvedValue(session);
      jwtService.signAsync
        .mockResolvedValueOnce('new-refresh-token')
        .mockResolvedValueOnce('new-access-token');

      await expect(service.refresh('refresh-token')).resolves.toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });

      expect(
        userSessionsRepository.rotateRefreshTokenIfMatches,
      ).toHaveBeenCalledTimes(2);
      expect(userSessionsRepository.revokeAllByUserId).not.toHaveBeenCalled();
    });

    it('throws InvalidRefreshTokenException when rotation fails and session is not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        sid: 'session-id',
        type: 'refresh',
      });
      userSessionsRepository.rotateRefreshTokenIfMatches.mockResolvedValue(
        false,
      );
      userSessionsRepository.findActiveById.mockResolvedValue(null);

      await expect(service.refresh('refresh-token')).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
      });

      expect(userSessionsRepository.revokeAllByUserId).not.toHaveBeenCalled();
    });

    it('revokes all user sessions when refresh token hash does not match outside grace window', async () => {
      const session = createSessionFixture({
        refreshTokenHash: 'other-hash',
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        sid: 'session-id',
        type: 'refresh',
      });
      userSessionsRepository.rotateRefreshTokenIfMatches.mockResolvedValue(
        false,
      );
      userSessionsRepository.findActiveById.mockResolvedValue(session);

      await expect(
        service.refresh('stolen-refresh-token'),
      ).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
      });

      expect(userSessionsRepository.revokeAllByUserId).toHaveBeenCalledWith(
        'user-id',
      );
      expect(userSessionsRepository.save).not.toHaveBeenCalled();
    });

    it('does not revoke all sessions when rotation fails within grace window', async () => {
      const session = createSessionFixture({
        refreshTokenHash: 'rotated-hash',
        updatedAt: new Date(),
      });

      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        sid: 'session-id',
        type: 'refresh',
      });
      userSessionsRepository.rotateRefreshTokenIfMatches.mockResolvedValue(
        false,
      );
      userSessionsRepository.findActiveById.mockResolvedValue(session);

      await expect(service.refresh('refresh-token')).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
      });

      expect(userSessionsRepository.revokeAllByUserId).not.toHaveBeenCalled();
    });

    it('throws InvalidRefreshTokenException when JWT verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(
        new TokenExpiredError('jwt expired', new Date()),
      );

      await expect(service.refresh('refresh-token')).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
      });
    });

    it('rethrows infrastructure errors from JWT verification', async () => {
      const infrastructureError = new Error('secret missing');

      jwtService.verifyAsync.mockRejectedValue(infrastructureError);

      await expect(service.refresh('refresh-token')).rejects.toBe(
        infrastructureError,
      );
    });
  });

  describe('logout', () => {
    it('revokes current session', async () => {
      const session = createSessionFixture();

      userSessionsRepository.findActiveById.mockResolvedValue(session);

      await service.logout({ userId: 'user-id', sessionId: 'session-id' });

      expect(userSessionsRepository.revokeById).toHaveBeenCalledWith(
        'session-id',
      );
    });

    it('throws SessionNotFoundException when session does not belong to user', async () => {
      userSessionsRepository.findActiveById.mockResolvedValue(
        createSessionFixture({ userId: 'another-user' }),
      );

      await expect(
        service.logout({ userId: 'user-id', sessionId: 'session-id' }),
      ).rejects.toMatchObject({
        code: AuthErrorCode.SESSION_NOT_FOUND,
      });
    });
  });

  describe('revokeSession', () => {
    it('revokes session by id', async () => {
      const session = createSessionFixture();

      userSessionsRepository.findActiveById.mockResolvedValue(session);

      await service.revokeSession(
        { userId: 'user-id', sessionId: 'current-session' },
        'session-id',
      );

      expect(userSessionsRepository.revokeById).toHaveBeenCalledWith(
        'session-id',
      );
    });
  });

  describe('revokeOtherSessions', () => {
    it('revokes all sessions except current', async () => {
      await service.revokeOtherSessions({
        userId: 'user-id',
        sessionId: 'current-session',
      });

      expect(userSessionsRepository.revokeAllExcept).toHaveBeenCalledWith(
        'user-id',
        'current-session',
      );
    });
  });

  describe('validateAccessSession', () => {
    it('returns authenticated user and touches stale session', async () => {
      const session = createSessionFixture({
        lastOnline: new Date('2026-01-01T00:00:00.000Z'),
      });

      userSessionsRepository.findActiveById.mockResolvedValue(session);

      await expect(
        service.validateAccessSession({
          sub: 'user-id',
          sid: 'session-id',
          type: 'access',
        }),
      ).resolves.toEqual({
        userId: 'user-id',
        sessionId: 'session-id',
      });

      expect(
        userSessionsRepository.touchLastOnlineIfStale,
      ).toHaveBeenCalledWith('session-id', expect.any(Date));
    });

    it('throws InvalidAccessTokenException when token type is not access', async () => {
      await expect(
        service.validateAccessSession({
          sub: 'user-id',
          sid: 'session-id',
          type: 'refresh',
        }),
      ).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
      });
    });

    it('throws InvalidAccessTokenException when session is not active', async () => {
      userSessionsRepository.findActiveById.mockResolvedValue(null);

      await expect(
        service.validateAccessSession({
          sub: 'user-id',
          sid: 'session-id',
          type: 'access',
        }),
      ).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
      });
    });
  });

  describe('touchSessionIfStale', () => {
    it('does not update lastOnline when session was active recently', async () => {
      const session = createSessionFixture({
        lastOnline: new Date(),
      });

      await service.touchSessionIfStale(session);

      expect(
        userSessionsRepository.touchLastOnlineIfStale,
      ).not.toHaveBeenCalled();
    });

    it('updates lastOnline when session is stale', async () => {
      const session = createSessionFixture({
        lastOnline: new Date('2026-01-01T00:00:00.000Z'),
      });

      await service.touchSessionIfStale(session);

      expect(
        userSessionsRepository.touchLastOnlineIfStale,
      ).toHaveBeenCalledWith('session-id', expect.any(Date));
    });
  });
});
