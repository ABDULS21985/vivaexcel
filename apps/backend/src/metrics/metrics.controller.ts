import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({
    summary: 'Get Prometheus metrics',
    description: 'Returns all application metrics in Prometheus format',
  })
  @ApiProduces('text/plain')
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics in text format',
  })
  async getMetrics(@Res() res: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.getMetrics();
      res.set('Content-Type', this.metricsService.getContentType());
      res.send(metrics);
    } catch (error) {
      res.status(500).send('Error collecting metrics');
    }
  }
}
