import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '@/common/exceptions';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { InvalidAccessTokenException } from '../exceptions/invalid-access-token.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  public constructor(private readonly _reflector: Reflector) {
    super();
  }

  public override canActivate(context: ExecutionContext) {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  public override handleRequest<TUser>(
    err: unknown,
    user: TUser,
    info: unknown,
  ): TUser {
    if (err instanceof DomainException) {
      throw err;
    }

    if (err || info || !user) {
      throw new InvalidAccessTokenException();
    }

    return user;
  }
}
