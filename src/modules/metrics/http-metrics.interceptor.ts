import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Request, Response } from 'express';
import type { Counter, Histogram } from 'prom-client';
import type { Observable } from 'rxjs';
import {
  HTTP_REQUESTS_TOTAL,
  HTTP_REQUEST_DURATION_SECONDS,
  isMetricsExcludedPath,
} from './http-metrics.constants';

type ExpressRoute = {
  path?: string | string[];
};

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  public constructor(
    @InjectMetric(HTTP_REQUESTS_TOTAL)
    private readonly _requestsTotal: Counter,
    @InjectMetric(HTTP_REQUEST_DURATION_SECONDS)
    private readonly _requestDuration: Histogram,
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    if (isMetricsExcludedPath(request.originalUrl || request.url || '')) {
      return next.handle();
    }

    const startedAt = process.hrtime.bigint();

    response.once('finish', () => {
      this._record(request, response, startedAt);
    });

    return next.handle();
  }

  private _record(
    request: Request,
    response: Response,
    startedAt: bigint,
  ): void {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const labels = {
      method: request.method,
      route: this._resolveRoute(request),
      status_code: String(response.statusCode),
    };

    this._requestsTotal.inc(labels);
    this._requestDuration.observe(labels, durationSeconds);
  }

  private _resolveRoute(request: Request): string {
    const route = request.route as ExpressRoute | undefined;
    const routePath = route?.path;
    const normalizedPath = Array.isArray(routePath) ? routePath[0] : routePath;

    if (typeof normalizedPath === 'string' && normalizedPath.length > 0) {
      const baseUrl = request.baseUrl || '';
      const fullPath = `${baseUrl}${normalizedPath}`;

      return fullPath.replace(/\/$/, '') || '/';
    }

    const rawUrl = request.originalUrl || request.url || 'unknown';

    return rawUrl.split('?')[0] ?? 'unknown';
  }
}
