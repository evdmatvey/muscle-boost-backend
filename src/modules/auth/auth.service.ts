import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { parseDurationToMs } from '@/common/utils/parse-duration.util';
import {
  REFRESH_ROTATION_GRACE_SECONDS_KEY,
  SESSION_LAST_ONLINE_THRESHOLD_MINUTES_KEY,
} from '@/config/auth.config';
import {
  JWT_ACCESS_EXPIRES_IN_KEY,
  JWT_ACCESS_SECRET_KEY,
  JWT_REFRESH_EXPIRES_IN_KEY,
  JWT_REFRESH_SECRET_KEY,
} from '@/config/jwt.config';
import { UserProfilesService } from '@/modules/user-profiles';
import { UserNotFoundException, UsersService } from '@/modules/users';
import type { UserSession } from './entities/user-session.entity';
import { InvalidAccessTokenException } from './exceptions/invalid-access-token.exception';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { InvalidRefreshTokenException } from './exceptions/invalid-refresh-token.exception';
import { SessionNotFoundException } from './exceptions/session-not-found.exception';
import type { AuthTokens } from './interfaces/auth-tokens.interface';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { AuthTokenPayload } from './interfaces/jwt-payload.interface';
import {
  type IUserSessionsRepository,
  USER_SESSIONS_REPOSITORY,
} from './repositories/user-sessions.repository.interface';
import { isJwtVerificationError } from './utils/is-jwt-verification-error.util';
import { parseDeviceName } from './utils/parse-device-name.util';
import { hashPassword, verifyPassword } from './utils/password.util';
import { hashRefreshToken } from './utils/refresh-token-hash.util';

@Injectable()
export class AuthService {
  public constructor(
    private readonly _usersService: UsersService,
    private readonly _userProfilesService: UserProfilesService,
    @Inject(USER_SESSIONS_REPOSITORY)
    private readonly _userSessionsRepository: IUserSessionsRepository,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  public async register(
    email: string,
    password: string,
    userAgent: string,
  ): Promise<AuthTokens> {
    const passwordHash = await hashPassword(password);
    const user = await this._usersService.create({ email, passwordHash });
    await this._userProfilesService.createForUser(user.id);

    return this._issueTokens(user.id, parseDeviceName(userAgent));
  }

  public async login(
    email: string,
    password: string,
    userAgent: string,
  ): Promise<AuthTokens> {
    const user = await this._findUserByEmailOrThrow(email);
    const isPasswordValid = await verifyPassword(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return this._issueTokens(user.id, parseDeviceName(userAgent));
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this._verifyRefreshToken(refreshToken);
    const expectedHash = hashRefreshToken(refreshToken);
    const now = new Date();
    const newRefreshToken = await this._signRefreshToken(
      payload.sub,
      payload.sid,
    );
    const rotateParams = {
      sessionId: payload.sid,
      userId: payload.sub,
      expectedHash,
      newHash: hashRefreshToken(newRefreshToken),
      lastOnline: now,
      expiresAt: this._getRefreshExpiresAt(now),
    };

    let rotated =
      await this._userSessionsRepository.rotateRefreshTokenIfMatches(
        rotateParams,
      );

    if (!rotated) {
      const session = await this._userSessionsRepository.findActiveById(
        payload.sid,
      );

      if (session?.refreshTokenHash === expectedHash) {
        rotated =
          await this._userSessionsRepository.rotateRefreshTokenIfMatches(
            rotateParams,
          );
      }

      if (!rotated) {
        await this._handleRefreshTokenReuse(session);
      }
    }

    const accessToken = await this._signAccessToken(payload.sub, payload.sid);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this._getAccessExpiresInSeconds(),
    };
  }

  public async logout(user: AuthenticatedUser): Promise<void> {
    const session = await this._userSessionsRepository.findActiveById(
      user.sessionId,
    );

    if (!session || session.userId !== user.userId) {
      throw new SessionNotFoundException();
    }

    await this._userSessionsRepository.revokeById(session.id);
  }

  public async getSessions(user: AuthenticatedUser) {
    return this._userSessionsRepository.findActiveByUserId(user.userId);
  }

  public async revokeSession(
    user: AuthenticatedUser,
    sessionId: string,
  ): Promise<void> {
    const session =
      await this._userSessionsRepository.findActiveById(sessionId);

    if (!session || session.userId !== user.userId) {
      throw new SessionNotFoundException();
    }

    await this._userSessionsRepository.revokeById(session.id);
  }

  public async revokeOtherSessions(user: AuthenticatedUser): Promise<void> {
    await this._userSessionsRepository.revokeAllExcept(
      user.userId,
      user.sessionId,
    );
  }

  public async validateAccessSession(
    payload: AuthTokenPayload,
  ): Promise<AuthenticatedUser> {
    if (payload.type !== 'access') {
      throw new InvalidAccessTokenException();
    }

    const session = await this._userSessionsRepository.findActiveById(
      payload.sid,
    );

    if (!session || session.userId !== payload.sub) {
      throw new InvalidAccessTokenException();
    }

    await this.touchSessionIfStale(session);

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  }

  public async touchSessionIfStale(session: UserSession): Promise<void> {
    const staleBefore = this._getSessionStaleBefore();

    if (!this._isSessionStale(session, staleBefore)) {
      return;
    }

    await this._userSessionsRepository.touchLastOnlineIfStale(
      session.id,
      staleBefore,
    );
  }

  private async _handleRefreshTokenReuse(
    session: UserSession | null,
  ): Promise<never> {
    if (!session) {
      throw new InvalidRefreshTokenException();
    }

    if (session.updatedAt >= this._getRefreshRotationGraceDeadline()) {
      throw new InvalidRefreshTokenException();
    }

    await this._userSessionsRepository.revokeAllByUserId(session.userId);
    throw new InvalidRefreshTokenException();
  }

  private _getRefreshRotationGraceDeadline(): Date {
    const graceSeconds = this._configService.getOrThrow<number>(
      REFRESH_ROTATION_GRACE_SECONDS_KEY,
    );

    return new Date(Date.now() - graceSeconds * 1000);
  }

  private _getSessionStaleBefore(): Date {
    const thresholdMinutes = this._configService.getOrThrow<number>(
      SESSION_LAST_ONLINE_THRESHOLD_MINUTES_KEY,
    );

    return new Date(Date.now() - thresholdMinutes * 60 * 1000);
  }

  private _isSessionStale(session: UserSession, staleBefore: Date): boolean {
    return session.lastOnline < staleBefore;
  }

  private async _findUserByEmailOrThrow(email: string) {
    try {
      return await this._usersService.getByEmail(email);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new InvalidCredentialsException();
      }

      throw error;
    }
  }

  private async _issueTokens(
    userId: string,
    deviceName: string,
  ): Promise<AuthTokens> {
    const now = new Date();
    const session = await this._userSessionsRepository.create({
      userId,
      deviceName,
      refreshTokenHash: '',
      lastOnline: now,
      expiresAt: this._getRefreshExpiresAt(now),
    });

    const refreshToken = await this._signRefreshToken(userId, session.id);

    session.refreshTokenHash = hashRefreshToken(refreshToken);
    await this._userSessionsRepository.save(session);

    const accessToken = await this._signAccessToken(userId, session.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: this._getAccessExpiresInSeconds(),
    };
  }

  private async _verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = await this._jwtService.verifyAsync<AuthTokenPayload>(
        token,
        {
          secret: this._configService.getOrThrow<string>(
            JWT_REFRESH_SECRET_KEY,
          ),
        },
      );

      if (payload.type !== 'refresh') {
        throw new InvalidRefreshTokenException();
      }

      return payload;
    } catch (error) {
      if (error instanceof InvalidRefreshTokenException) {
        throw error;
      }

      if (isJwtVerificationError(error)) {
        throw new InvalidRefreshTokenException();
      }

      throw error;
    }
  }

  private async _signAccessToken(
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const payload: AuthTokenPayload = {
      sub: userId,
      sid: sessionId,
      type: 'access',
    };

    return this._jwtService.signAsync(payload, {
      secret: this._configService.getOrThrow<string>(JWT_ACCESS_SECRET_KEY),
      expiresIn: this._getAccessExpiresIn(),
    });
  }

  private async _signRefreshToken(
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const payload: AuthTokenPayload = {
      sub: userId,
      sid: sessionId,
      type: 'refresh',
    };

    return this._jwtService.signAsync(payload, {
      secret: this._configService.getOrThrow<string>(JWT_REFRESH_SECRET_KEY),
      expiresIn: this._getRefreshExpiresIn(),
    });
  }

  private _getAccessExpiresInSeconds(): number {
    const expiresIn = this._configService.getOrThrow<string>(
      JWT_ACCESS_EXPIRES_IN_KEY,
    );

    return Math.floor(parseDurationToMs(expiresIn) / 1000);
  }

  private _getAccessExpiresIn(): JwtSignOptions['expiresIn'] {
    return this._configService.getOrThrow<string>(
      JWT_ACCESS_EXPIRES_IN_KEY,
    ) as JwtSignOptions['expiresIn'];
  }

  private _getRefreshExpiresIn(): JwtSignOptions['expiresIn'] {
    return this._configService.getOrThrow<string>(
      JWT_REFRESH_EXPIRES_IN_KEY,
    ) as JwtSignOptions['expiresIn'];
  }

  private _getRefreshExpiresAt(from: Date): Date {
    const refreshExpiresIn = this._configService.getOrThrow<string>(
      JWT_REFRESH_EXPIRES_IN_KEY,
    );

    return new Date(from.getTime() + parseDurationToMs(refreshExpiresIn));
  }
}
