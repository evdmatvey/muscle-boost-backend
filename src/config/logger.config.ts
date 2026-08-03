import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Params } from 'nestjs-pino';
import { stdSerializers } from 'pino-http';

const REQUEST_ID_HEADER = 'x-request-id';
const SENSITIVE_AUTH_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
] as const;

const isIgnoredAccessLogPath = (url: string): boolean => {
  const path = url.split('?')[0] ?? url;

  return path === '/metrics' || path.startsWith('/api/health');
};

const isSensitiveAuthPath = (url: string): boolean => {
  const path = url.split('?')[0] ?? url;

  return SENSITIVE_AUTH_PATHS.some(
    (sensitivePath) =>
      path === sensitivePath || path.startsWith(`${sensitivePath}/`),
  );
};

const resolveRequestId = (
  req: IncomingMessage,
  res: ServerResponse,
): string => {
  const headerValue = req.headers[REQUEST_ID_HEADER];
  const fromHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const requestId =
    typeof fromHeader === 'string' && fromHeader.trim().length > 0
      ? fromHeader.trim()
      : randomUUID();

  res.setHeader('X-Request-Id', requestId);

  return requestId;
};

export type LoggerConfigInput = {
  appEnv: string;
  logLevel: string;
};

export const getLoggerParams = ({
  appEnv,
  logLevel,
}: LoggerConfigInput): Params => {
  const isLocal = appEnv === 'local';

  return {
    pinoHttp: {
      level: logLevel,
      base: {
        app: 'muscle-boost-backend',
        env: appEnv,
      },
      genReqId: resolveRequestId,
      autoLogging: {
        ignore: (req) => isIgnoredAccessLogPath(req.url ?? ''),
      },
      redact: {
        paths: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.refreshToken',
          'req.body.accessToken',
          '*.password',
          '*.refreshToken',
          '*.accessToken',
        ],
        censor: '[Redacted]',
      },
      serializers: {
        req(req: IncomingMessage) {
          const serialized = stdSerializers.req(req);
          const url = req.url ?? '';

          if (isSensitiveAuthPath(url)) {
            return {
              ...serialized,
              body: '[Redacted]',
            };
          }

          return serialized;
        },
      },
      ...(isLocal
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
              },
            },
          }
        : {}),
    },
  };
};
