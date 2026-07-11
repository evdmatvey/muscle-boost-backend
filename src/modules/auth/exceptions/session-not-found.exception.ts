import { NotFoundDomainException } from '@/common/exceptions';
import { AuthErrorCode } from '../messages/auth.error-codes';
import { AuthMessages } from '../messages/auth.messages';

export class SessionNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      AuthErrorCode.SESSION_NOT_FOUND,
      AuthMessages[AuthErrorCode.SESSION_NOT_FOUND],
    );
  }
}
