import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import {
  HTTP_DURATION_BUCKETS,
  HTTP_REQUESTS_TOTAL,
  HTTP_REQUEST_DURATION_SECONDS,
} from './http-metrics.constants';
import { HttpMetricsMiddleware } from './http-metrics.middleware';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      controller: MetricsController,
      useFactory: (configService: ConfigService) => ({
        path: '/metrics',
        defaultMetrics: {
          enabled: true,
        },
        defaultLabels: {
          app: 'muscle-boost-backend',
          env: configService.getOrThrow<string>('APP_ENV'),
        },
      }),
    }),
  ],
  providers: [
    makeCounterProvider({
      name: HTTP_REQUESTS_TOTAL,
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
    makeHistogramProvider({
      name: HTTP_REQUEST_DURATION_SECONDS,
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [...HTTP_DURATION_BUCKETS],
    }),
    HttpMetricsMiddleware,
  ],
  exports: [PrometheusModule],
})
export class MetricsModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpMetricsMiddleware).forRoutes('{*splat}');
  }
}
