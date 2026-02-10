import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceStatusEntity,
  ServiceStatus,
} from '../../../entities/service-status.entity';
import { MetricsService } from '../../../metrics/metrics.service';
import { DatabaseHealthIndicator } from '../../../health/indicators/database.indicator';
import { RedisHealthIndicator } from '../../../health/indicators/redis.indicator';
import { StripeHealthIndicator } from '../../../health/indicators/stripe.indicator';
import { StorageHealthIndicator } from '../../../health/indicators/storage.indicator';
import { EmailHealthIndicator } from '../../../health/indicators/email.indicator';
import { RedisService } from '../../../shared/redis/redis.service';

interface HealthCheckResult {
  serviceName: string;
  displayName: string;
  status: ServiceStatus;
  latency: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class HealthMonitorService {
  private readonly logger = new Logger(HealthMonitorService.name);

  private readonly serviceMap: Array<{
    serviceName: string;
    displayName: string;
    check: () => Promise<unknown>;
  }>;

  constructor(
    @InjectRepository(ServiceStatusEntity)
    private readonly serviceStatusRepo: Repository<ServiceStatusEntity>,
    private readonly metricsService: MetricsService,
    private readonly redisService: RedisService,
    private readonly databaseIndicator: DatabaseHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly stripeIndicator: StripeHealthIndicator,
    private readonly storageIndicator: StorageHealthIndicator,
    private readonly emailIndicator: EmailHealthIndicator,
  ) {
    this.serviceMap = [
      {
        serviceName: 'postgresql',
        displayName: 'PostgreSQL Database',
        check: () => this.databaseIndicator.isHealthy('database'),
      },
      {
        serviceName: 'redis',
        displayName: 'Redis Cache',
        check: () => this.redisIndicator.isHealthy('redis'),
      },
      {
        serviceName: 'stripe-api',
        displayName: 'Stripe API',
        check: () => this.stripeIndicator.isHealthy('stripe'),
      },
      {
        serviceName: 's3-storage',
        displayName: 'S3 Storage',
        check: () => this.storageIndicator.isHealthy('storage'),
      },
      {
        serviceName: 'smtp-email',
        displayName: 'SMTP Email',
        check: () => this.emailIndicator.isHealthy('email'),
      },
    ];
  }

  @Cron('*/30 * * * * *')
  async runHealthChecks(): Promise<void> {
    const results: HealthCheckResult[] = [];

    const checkPromises = this.serviceMap.map(async (service) => {
      const start = Date.now();
      try {
        const result = await service.check();
        const latency = Date.now() - start;
        results.push({
          serviceName: service.serviceName,
          displayName: service.displayName,
          status: ServiceStatus.UP,
          latency,
          metadata: result as Record<string, unknown>,
        });
      } catch {
        const latency = Date.now() - start;
        results.push({
          serviceName: service.serviceName,
          displayName: service.displayName,
          status: ServiceStatus.DOWN,
          latency,
        });
      }
    });

    await Promise.allSettled(checkPromises);

    // API server is always up if we're running
    results.push({
      serviceName: 'api-server',
      displayName: 'API Server',
      status: ServiceStatus.UP,
      latency: 0,
    });

    // Update metrics and database
    for (const result of results) {
      this.metricsService.setHealthCheckStatus(
        result.serviceName,
        result.status === ServiceStatus.UP,
      );
      this.metricsService.setHealthCheckLatency(
        result.serviceName,
        result.latency,
      );

      await this.upsertServiceStatus(result);
    }
  }

  private async upsertServiceStatus(result: HealthCheckResult): Promise<void> {
    try {
      const existing = await this.serviceStatusRepo.findOne({
        where: { serviceName: result.serviceName },
      });

      if (existing) {
        // Compute rolling uptime
        const uptimePercentage = await this.computeUptimePercentage(
          result.serviceName,
          result.status === ServiceStatus.UP,
        );

        await this.serviceStatusRepo.update(existing.id, {
          status: result.status,
          latency: result.latency,
          lastCheckedAt: new Date(),
          metadata: result.metadata || existing.metadata,
          uptimePercentage,
        });
      } else {
        await this.serviceStatusRepo.save(
          this.serviceStatusRepo.create({
            serviceName: result.serviceName,
            displayName: result.displayName,
            status: result.status,
            latency: result.latency,
            lastCheckedAt: new Date(),
            metadata: result.metadata || null,
            uptimePercentage: result.status === ServiceStatus.UP ? 100 : 0,
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to update service status for ${result.serviceName}: ${(error as Error).message}`,
      );
    }
  }

  private async computeUptimePercentage(
    serviceName: string,
    isUp: boolean,
  ): Promise<number> {
    const key = `uptime:${serviceName}`;
    try {
      // Increment total checks
      const totalKey = `${key}:total`;
      const upKey = `${key}:up`;

      await this.redisService.incr(totalKey);
      if (isUp) {
        await this.redisService.incr(upKey);
      }

      // Set TTL to 90 days
      const ttl = 90 * 24 * 60 * 60;
      await this.redisService.expire(totalKey, ttl);
      await this.redisService.expire(upKey, ttl);

      const totalStr = await this.redisService.get(totalKey);
      const upStr = await this.redisService.get(upKey);
      const total = parseInt(totalStr || '1', 10);
      const up = parseInt(upStr || '0', 10);

      return Math.round((up / total) * 10000) / 100;
    } catch {
      return 100;
    }
  }

  async getAllServiceStatuses(): Promise<ServiceStatusEntity[]> {
    return this.serviceStatusRepo.find({
      order: { serviceName: 'ASC' },
    });
  }
}
