import { CommonErrorCode, CommonMessages } from '@/common/messages';
import type { ErrorDetail } from './domain.exception';
import { ValidationDomainException } from './validation.domain-exception';

export class RequestValidationException extends ValidationDomainException {
  public constructor(details: ErrorDetail[]) {
    super(
      CommonErrorCode.REQUEST_VALIDATION,
      CommonMessages[CommonErrorCode.REQUEST_VALIDATION],
      details,
    );
  }
}
