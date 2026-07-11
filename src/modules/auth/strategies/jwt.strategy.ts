import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ACCESS_SECRET_KEY } from '@/config/jwt.config';
import { AuthService } from '../auth.service';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { AuthTokenPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(
    configService: ConfigService,
    private readonly _authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(JWT_ACCESS_SECRET_KEY),
    });
  }

  public validate(payload: AuthTokenPayload): Promise<AuthenticatedUser> {
    return this._authService.validateAccessSession(payload);
  }
}
