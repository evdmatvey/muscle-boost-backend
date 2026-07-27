import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommonErrorCode, CommonMessages } from '@/common/messages';
import type { ErrorDetail } from '../exceptions';

type HttpExceptionBody = {
  message?: string | string[];
  error?: string;
  details?: ErrorDetail[];
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  public constructor(
    @InjectPinoLogger(AllExceptionsFilter.name)
    private readonly _logger: PinoLogger,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();
    const { statusCode, message, error, details } =
      this._resolveException(exception);
    const logPayload = {
      requestId: request.id,
      method: request.method,
      path: request.url,
      statusCode,
      error,
      message,
    };

    if (statusCode >= 500) {
      this._logger.error({
        ...logPayload,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      this._logger.warn(logPayload);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      ...(details?.length && { details }),
    });
  }

  private _resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
    details?: ErrorDetail[];
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        return {
          statusCode,
          message: body,
          error: HttpStatus[statusCode] ?? 'HTTP_ERROR',
        };
      }

      const typedBody = body as HttpExceptionBody;
      const message = Array.isArray(typedBody.message)
        ? typedBody.message.join(', ')
        : (typedBody.message ?? exception.message);

      return {
        statusCode,
        message,
        error:
          typeof typedBody.error === 'string'
            ? typedBody.error
            : (HttpStatus[statusCode] ?? 'HTTP_ERROR'),
        ...(typedBody.details?.length && { details: typedBody.details }),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: CommonMessages[CommonErrorCode.INTERNAL_ERROR],
      error: CommonErrorCode.INTERNAL_ERROR,
    };
  }
}
