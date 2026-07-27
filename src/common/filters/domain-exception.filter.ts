import { Catch } from '@nestjs/common';
import { ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
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
  public constructor(
    @InjectPinoLogger(DomainExceptionFilter.name)
    private readonly _logger: PinoLogger,
  ) {}

  public catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();
    const statusCode = this._resolveStatus(exception);
    const logPayload = {
      requestId: request.id,
      method: request.method,
      path: request.url,
      statusCode,
      error: exception.code,
      message: exception.message,
    };

    if (statusCode >= 500) {
      this._logger.error({ ...logPayload, stack: exception.stack });
    } else {
      this._logger.warn(logPayload);
    }

    response.status(statusCode).json({
      statusCode,
      message: exception.message,
      error: exception.code,
      ...(exception.details?.length && { details: exception.details }),
    });
  }

  private _resolveStatus(exception: DomainException): number {
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
}
