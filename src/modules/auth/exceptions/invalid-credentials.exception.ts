import { UnauthorizedDomainException } from '@/common/exceptions';
import { AuthErrorCode } from '../messages/auth.error-codes';
import { AuthMessages } from '../messages/auth.messages';

export class InvalidCredentialsException extends UnauthorizedDomainException {
  public constructor() {
    super(
      AuthErrorCode.INVALID_CREDENTIALS,
      AuthMessages[AuthErrorCode.INVALID_CREDENTIALS],
    );
  }
}
