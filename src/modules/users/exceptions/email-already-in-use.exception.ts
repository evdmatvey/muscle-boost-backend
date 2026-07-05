import { ConflictDomainException } from '@/common/exceptions';

export class EmailAlreadyInUseException extends ConflictDomainException {
  public constructor() {
    super('Email уже используется.', [
      { field: 'email', message: 'Email уже используется.' },
    ]);
  }
}
