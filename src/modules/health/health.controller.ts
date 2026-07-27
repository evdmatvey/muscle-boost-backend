import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@/modules/auth';

@ApiTags('health')
@Controller('health')
export class HealthController {
  public constructor(
    private readonly _health: HealthCheckService,
    private readonly _db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (no dependencies)' })
  @ApiOkResponse({ description: 'Process is alive' })
  public live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe (PostgreSQL)' })
  @ApiOkResponse({ description: 'Application is ready to accept traffic' })
  public ready(): Promise<HealthCheckResult> {
    return this._health.check([() => this._db.pingCheck('database')]);
  }
}
