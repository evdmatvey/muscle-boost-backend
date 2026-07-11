import { NotFoundDomainException } from '@/common/exceptions';
import { UsersErrorCode } from '../messages/users.error-codes';
import { UsersMessages } from '../messages/users.messages';

export class UserNotFoundException extends NotFoundDomainException {
  public constructor() {
    super(
      UsersErrorCode.USER_NOT_FOUND,
      UsersMessages[UsersErrorCode.USER_NOT_FOUND],
    );
  }
}
