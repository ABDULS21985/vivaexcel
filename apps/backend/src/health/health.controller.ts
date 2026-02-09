import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { Public } from '../common/decorators/public.decorator';
import { DatabaseHealthIndicator } from './indicators/database.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { MemoryHealthIndicator } from './indicators/memory.indicator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseIndicator: DatabaseHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly memoryIndicator: MemoryHealthIndicator,
  ) {}

  /**
   * Basic health check for load balancers
   * Only checks memory to ensure the process is responsive
   */
  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Lightweight health check for load balancers. Only checks memory usage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memoryIndicator.isHealthy('memory'),
    ]);
  }

  /**
   * Readiness probe with all dependency checks
   * Checks database, Redis, and memory
   */
  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Full readiness check including database, Redis, and memory.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to accept traffic',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
  })
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.databaseIndicator.isHealthy('database'),
      () => this.redisIndicator.isHealthy('redis'),
      () => this.memoryIndicator.isHealthy('memory'),
    ]);
  }
}
