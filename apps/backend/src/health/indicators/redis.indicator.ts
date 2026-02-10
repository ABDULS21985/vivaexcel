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

      // Get additional Redis info
      let usedMemory: string | undefined;
      let hitRate: number | undefined;
      let connectedClients: string | undefined;

      try {
        const client = this.redisService.getClient();

        const memoryInfo = await client.info('memory');
        const usedMemMatch = memoryInfo.match(/used_memory_human:(\S+)/);
        usedMemory = usedMemMatch?.[1];

        const statsInfo = await client.info('stats');
        const hitsMatch = statsInfo.match(/keyspace_hits:(\d+)/);
        const missesMatch = statsInfo.match(/keyspace_misses:(\d+)/);
        if (hitsMatch && missesMatch) {
          const hits = parseInt(hitsMatch[1], 10);
          const misses = parseInt(missesMatch[1], 10);
          const total = hits + misses;
          hitRate = total > 0 ? Math.round((hits / total) * 10000) / 100 : 100;
        }

        const clientsInfo = await client.info('clients');
        const clientsMatch = clientsInfo.match(/connected_clients:(\d+)/);
        connectedClients = clientsMatch?.[1];
      } catch {
        // Non-critical metadata, continue with basic health status
      }

      return this.getStatus(key, true, {
        connection: 'established',
        ...(usedMemory && { usedMemory }),
        ...(hitRate !== undefined && { hitRate: `${hitRate}%` }),
        ...(connectedClients && { connectedClients }),
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
