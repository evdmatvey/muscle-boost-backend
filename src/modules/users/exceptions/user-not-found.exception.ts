import { NotFoundDomainException } from '@/common/exceptions';

export class UserNotFoundException extends NotFoundDomainException {
  public constructor() {
    super('Пользователь не найден.');
  }
}
