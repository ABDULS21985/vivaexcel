import { Controller, Get, Logger } from '@nestjs/common';
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
import { StripeHealthIndicator } from './indicators/stripe.indicator';
import { StorageHealthIndicator } from './indicators/storage.indicator';
import { EmailHealthIndicator } from './indicators/email.indicator';

interface DetailedServiceStatus {
  status: 'up' | 'degraded' | 'down';
  latency: number;
  details?: Record<string, unknown>;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseIndicator: DatabaseHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly memoryIndicator: MemoryHealthIndicator,
    private readonly stripeIndicator: StripeHealthIndicator,
    private readonly storageIndicator: StorageHealthIndicator,
    private readonly emailIndicator: EmailHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Lightweight health check for load balancers. Only checks memory usage.',
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memoryIndicator.isHealthy('memory'),
    ]);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Full readiness check including database, Redis, and memory.',
  })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.databaseIndicator.isHealthy('database'),
      () => this.redisIndicator.isHealthy('redis'),
      () => this.memoryIndicator.isHealthy('memory'),
    ]);
  }

  @Get('detailed')
  @Public()
  @ApiOperation({
    summary: 'Detailed health check',
    description: 'Granular health data for every dependency with latency.',
  })
  @ApiResponse({ status: 200, description: 'Detailed health status of all services' })
  async detailed(): Promise<{
    status: 'success';
    data: Record<string, DetailedServiceStatus>;
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
  }> {
    const checks: Array<{
      name: string;
      key: string;
      fn: () => Promise<unknown>;
    }> = [
      { name: 'postgresql', key: 'database', fn: () => this.databaseIndicator.isHealthy('database') },
      { name: 'redis', key: 'redis', fn: () => this.redisIndicator.isHealthy('redis') },
      { name: 'stripe-api', key: 'stripe', fn: () => this.stripeIndicator.isHealthy('stripe') },
      { name: 's3-storage', key: 'storage', fn: () => this.storageIndicator.isHealthy('storage') },
      { name: 'smtp-email', key: 'email', fn: () => this.emailIndicator.isHealthy('email') },
    ];

    const results: Record<string, DetailedServiceStatus> = {};
    let hasDown = false;
    let hasDegraded = false;

    const settledResults = await Promise.allSettled(
      checks.map(async (check) => {
        const start = Date.now();
        try {
          const result = await check.fn();
          const latency = Date.now() - start;
          return { name: check.name, key: check.key, status: 'up' as const, latency, details: result };
        } catch (error) {
          const latency = Date.now() - start;
          return {
            name: check.name,
            key: check.key,
            status: 'down' as const,
            latency,
            details: { error: (error as Error).message },
          };
        }
      }),
    );

    for (const settled of settledResults) {
      if (settled.status === 'fulfilled') {
        const { name, status, latency, details } = settled.value;
        results[name] = { status, latency, details: details as Record<string, unknown> };
        if (status === 'down') hasDown = true;
        if (status === 'degraded') hasDegraded = true;
      }
    }

    // API server itself is always up if this endpoint responds
    results['api-server'] = { status: 'up', latency: 0 };

    const overallStatus = hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    return {
      status: 'success',
      data: results,
      overallStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
