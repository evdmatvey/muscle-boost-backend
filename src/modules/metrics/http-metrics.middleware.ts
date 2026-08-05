import { Injectable, type NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { NextFunction, Request, Response } from 'express';
import type { Counter, Histogram } from 'prom-client';
import {
  HTTP_REQUESTS_TOTAL,
  HTTP_REQUEST_DURATION_SECONDS,
  isMetricsExcludedPath,
} from './http-metrics.constants';
import { resolveHttpRoute } from './http-metrics.util';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  public constructor(
    @InjectMetric(HTTP_REQUESTS_TOTAL)
    private readonly _requestsTotal: Counter,
    @InjectMetric(HTTP_REQUEST_DURATION_SECONDS)
    private readonly _requestDuration: Histogram,
  ) {}

  public use(request: Request, response: Response, next: NextFunction): void {
    if (isMetricsExcludedPath(request.originalUrl || request.url || '')) {
      next();

      return;
    }

    const startedAt = process.hrtime.bigint();

    response.once('finish', () => {
      this._record(request, response, startedAt);
    });

    next();
  }

  private _record(
    request: Request,
    response: Response,
    startedAt: bigint,
  ): void {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const labels = {
      method: request.method,
      route: resolveHttpRoute(request),
      status_code: String(response.statusCode),
    };

    this._requestsTotal.inc(labels);
    this._requestDuration.observe(labels, durationSeconds);
  }
}
