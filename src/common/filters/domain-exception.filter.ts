import { Catch } from '@nestjs/common';
import { ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import {
  ConflictDomainException,
  DomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
  UnauthorizedDomainException,
  ValidationDomainException,
} from '../exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: DomainException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = this.resolveStatus(exception);

    response.status(statusCode).json({
      statusCode,
      message: exception.message,
      error: this.resolveCode(exception),
      ...(exception.details?.length && { details: exception.details }),
    });
  }

  private resolveStatus(exception: DomainException): number {
    if (exception instanceof ConflictDomainException) {
      return 409;
    }

    if (exception instanceof NotFoundDomainException) {
      return 404;
    }

    if (exception instanceof ForbiddenDomainException) {
      return 403;
    }

    if (exception instanceof UnauthorizedDomainException) {
      return 401;
    }

    if (exception instanceof ValidationDomainException) {
      return 400;
    }

    return 500;
  }

  private resolveCode(exception: DomainException): string {
    return exception.name
      .replace(/Exception$/, '')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase();
  }
}
