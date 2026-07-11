import { UnauthorizedDomainException } from '@/common/exceptions';
import { AuthErrorCode } from '../messages/auth.error-codes';
import { AuthMessages } from '../messages/auth.messages';

export class InvalidAccessTokenException extends UnauthorizedDomainException {
  public constructor() {
    super(
      AuthErrorCode.INVALID_ACCESS_TOKEN,
      AuthMessages[AuthErrorCode.INVALID_ACCESS_TOKEN],
    );
  }
}
