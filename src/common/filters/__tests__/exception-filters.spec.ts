import { type ArgumentsHost, BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { PinoLogger } from 'nestjs-pino';
import { CommonErrorCode } from '@/common/messages';
import { DomainException } from '../../exceptions';
import { NotFoundDomainException } from '../../exceptions/not-found.domain-exception';
import { AllExceptionsFilter } from '../all-exceptions.filter';
import { DomainExceptionFilter } from '../domain-exception.filter';

class ClientDomainException extends NotFoundDomainException {
  public constructor() {
    super('NOT_FOUND', 'Ресурс не найден.');
  }
}

class ServerDomainException extends DomainException {
  public constructor() {
    super('UNEXPECTED_DOMAIN', 'Неожиданная ошибка домена.');
  }
}

const createHost = (overrides?: {
  requestId?: string;
}): {
  host: ArgumentsHost;
  responseJson: jest.Mock;
  responseStatus: jest.Mock;
} => {
  const responseJson = jest.fn();
  const responseStatus = jest.fn().mockReturnValue({ json: responseJson });

  return {
    host: {
      switchToHttp: () => ({
        getRequest: () => ({
          id: overrides?.requestId ?? 'req-1',
          method: 'GET',
          url: '/api/v1/test',
        }),
        getResponse: () => ({
          status: responseStatus,
        }),
        getNext: () => undefined,
      }),
    } as ArgumentsHost,
    responseJson,
    responseStatus,
  };
};

const createLogger = (): {
  logger: PinoLogger;
  warn: jest.Mock;
  error: jest.Mock;
} => {
  const warn = jest.fn();
  const error = jest.fn();

  return {
    logger: { warn, error } as unknown as PinoLogger,
    warn,
    error,
  };
};

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let warn: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    const logger = createLogger();

    warn = logger.warn;
    error = logger.error;
    filter = new DomainExceptionFilter(logger.logger);
  });

  it('maps 4xx domain exception, responds with API shape and logs warn', () => {
    const { host, responseJson, responseStatus } = createHost();
    const exception = new ClientDomainException();

    filter.catch(exception, host);

    expect(responseStatus).toHaveBeenCalledWith(404);
    expect(responseJson).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Ресурс не найден.',
      error: 'NOT_FOUND',
    });
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        statusCode: 404,
        error: 'NOT_FOUND',
      }),
    );
    expect(error).not.toHaveBeenCalled();
  });

  it('maps 5xx domain exception and logs error with stack', () => {
    const { host, responseJson, responseStatus } = createHost();
    const exception = new ServerDomainException();

    filter.catch(exception, host);

    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Неожиданная ошибка домена.',
      error: 'UNEXPECTED_DOMAIN',
    });
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        statusCode: 500,
        error: 'UNEXPECTED_DOMAIN',
        stack: expect.any(String),
      }),
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let warn: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    const logger = createLogger();

    warn = logger.warn;
    error = logger.error;
    filter = new AllExceptionsFilter(logger.logger);
  });

  it('maps HttpException to API shape and logs warn for 4xx', () => {
    const { host, responseJson, responseStatus } = createHost();

    filter.catch(new BadRequestException('Bad input'), host);

    expect(responseStatus).toHaveBeenCalledWith(400);
    expect(responseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Bad input',
        error: 'Bad Request',
      }),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        requestId: 'req-1',
      }),
    );
    expect(error).not.toHaveBeenCalled();
  });

  it('maps unknown Error to INTERNAL_ERROR without stack in response', () => {
    const { host, responseJson, responseStatus } = createHost();
    const exception = new Error('boom');

    filter.catch(exception, host);

    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({
      statusCode: 500,
      message: expect.any(String),
      error: CommonErrorCode.INTERNAL_ERROR,
    });
    expect(responseJson.mock.calls[0]?.[0]).not.toHaveProperty('stack');
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: CommonErrorCode.INTERNAL_ERROR,
        stack: expect.any(String),
      }),
    );
  });
});
