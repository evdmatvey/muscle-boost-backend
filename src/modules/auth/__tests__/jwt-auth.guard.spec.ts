import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { InvalidAccessTokenException } from '../exceptions/invalid-access-token.exception';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthErrorCode } from '../messages/auth.error-codes';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard(new Reflector());
  });

  it('returns user when authentication succeeds', () => {
    const user: AuthenticatedUser = {
      userId: 'user-id',
      sessionId: 'session-id',
    };

    expect(guard.handleRequest(null, user, undefined)).toBe(user);
  });

  it('throws InvalidAccessTokenException when token is expired', () => {
    expect(() =>
      guard.handleRequest(
        null,
        null,
        new TokenExpiredError('jwt expired', new Date()),
      ),
    ).toThrow(
      expect.objectContaining({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
      }),
    );
  });

  it('throws InvalidAccessTokenException when token is invalid', () => {
    expect(() =>
      guard.handleRequest(null, null, new JsonWebTokenError('invalid token')),
    ).toThrow(
      expect.objectContaining({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
      }),
    );
  });

  it('throws InvalidAccessTokenException when user is missing', () => {
    expect(() => guard.handleRequest(null, null, undefined)).toThrow(
      expect.objectContaining({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
      }),
    );
  });

  it('rethrows DomainException from strategy validation', () => {
    const exception = new InvalidAccessTokenException();

    expect(() => guard.handleRequest(exception, null, undefined)).toThrow(
      exception,
    );
  });
});
