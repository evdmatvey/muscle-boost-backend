import { ConfigService } from '@nestjs/config';
import { Test as NestTest, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthService } from '../auth.service';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<Pick<AuthService, 'validateAccessSession'>>;

  beforeEach(async () => {
    authService = {
      validateAccessSession: jest.fn(),
    };

    const module: TestingModule = await NestTest.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('access-secret'),
          },
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('delegates access token validation to AuthService', async () => {
    const payload = {
      sub: 'user-id',
      sid: 'session-id',
      type: 'access' as const,
    };
    const authenticatedUser: AuthenticatedUser = {
      userId: 'user-id',
      sessionId: 'session-id',
    };

    authService.validateAccessSession.mockResolvedValue(authenticatedUser);

    await expect(strategy.validate(payload)).resolves.toBe(authenticatedUser);

    expect(authService.validateAccessSession).toHaveBeenCalledWith(payload);
  });
});
