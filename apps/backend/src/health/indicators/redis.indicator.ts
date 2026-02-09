import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.redisService.isHealthy();

      if (!isHealthy) {
        throw new Error('Redis ping failed');
      }

      return this.getStatus(key, true, {
        connection: 'established',
      });
    } catch (error) {
      this.logger.error(`Redis health check failed: ${(error as Error).message}`);

      const result = this.getStatus(key, false, {
        message: (error as Error).message,
      });

      throw new HealthCheckError('Redis health check failed', result);
    }
  }
}
