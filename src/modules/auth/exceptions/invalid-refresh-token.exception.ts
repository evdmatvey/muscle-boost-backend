import { UnauthorizedDomainException } from '@/common/exceptions';
import { AuthErrorCode } from '../messages/auth.error-codes';
import { AuthMessages } from '../messages/auth.messages';

export class InvalidRefreshTokenException extends UnauthorizedDomainException {
  public constructor() {
    super(
      AuthErrorCode.INVALID_REFRESH_TOKEN,
      AuthMessages[AuthErrorCode.INVALID_REFRESH_TOKEN],
    );
  }
}
