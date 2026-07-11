import type { AuthTokensResponseDto } from '../dto/auth-tokens.response.dto';
import type { SessionResponseDto } from '../dto/session.response.dto';
import type { UserSession } from '../entities/user-session.entity';
import type { AuthTokens } from '../interfaces/auth-tokens.interface';

export const toAuthTokensResponse = (
  tokens: AuthTokens,
): AuthTokensResponseDto => {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  };
};

export const toSessionResponse = (
  session: UserSession,
  currentSessionId: string,
): SessionResponseDto => {
  return {
    id: session.id,
    deviceName: session.deviceName,
    lastOnline: session.lastOnline.toISOString(),
    createdAt: session.createdAt.toISOString(),
    isCurrent: session.id === currentSessionId,
  };
};
