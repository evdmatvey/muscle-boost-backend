import type { ErrorDetail } from './domain.exception';
import { ValidationDomainException } from './validation.domain-exception';

export class RequestValidationException extends ValidationDomainException {
  public constructor(details: ErrorDetail[]) {
    super('Проверьте введённые данные.', details);
  }
}
