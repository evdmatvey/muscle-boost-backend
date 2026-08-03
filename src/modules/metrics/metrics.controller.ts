import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import type { Response } from 'express';
import { Public } from '@/modules/auth';

@ApiExcludeController()
@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Public()
  @Get()
  public override async index(
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    return super.index(response);
  }
}
