import { ConflictDomainException } from '@/common/exceptions';
import { createFieldErrorDetail } from '@/common/utils/create-field-error-detail.util';
import { UsersErrorCode } from '../messages/users.error-codes';
import { UsersMessages } from '../messages/users.messages';

export class EmailAlreadyInUseException extends ConflictDomainException {
  public constructor() {
    const message = UsersMessages[UsersErrorCode.EMAIL_ALREADY_IN_USE];

    super(UsersErrorCode.EMAIL_ALREADY_IN_USE, message, [
      createFieldErrorDetail('email', message),
    ]);
  }
}
