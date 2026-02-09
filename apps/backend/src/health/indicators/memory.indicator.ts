import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

export interface MemoryHealthOptions {
  // Heap used threshold in bytes (default: 500MB)
  heapUsedThreshold?: number;
  // RSS threshold in bytes (default: 1GB)
  rssThreshold?: number;
}

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(MemoryHealthIndicator.name);

  private readonly defaultOptions: MemoryHealthOptions = {
    heapUsedThreshold: 500 * 1024 * 1024, // 500MB
    rssThreshold: 1024 * 1024 * 1024, // 1GB
  };

  async isHealthy(
    key: string,
    options?: MemoryHealthOptions,
  ): Promise<HealthIndicatorResult> {
    const opts = { ...this.defaultOptions, ...options };
    const memoryUsage = process.memoryUsage();

    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);
    const externalMB = Math.round(memoryUsage.external / 1024 / 1024);

    const heapUsedThresholdMB = Math.round(
      (opts.heapUsedThreshold ?? this.defaultOptions.heapUsedThreshold!) / 1024 / 1024,
    );
    const rssThresholdMB = Math.round(
      (opts.rssThreshold ?? this.defaultOptions.rssThreshold!) / 1024 / 1024,
    );

    const isHeapHealthy =
      memoryUsage.heapUsed < (opts.heapUsedThreshold ?? this.defaultOptions.heapUsedThreshold!);
    const isRssHealthy =
      memoryUsage.rss < (opts.rssThreshold ?? this.defaultOptions.rssThreshold!);

    const memoryDetails = {
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      rss: `${rssMB}MB`,
      external: `${externalMB}MB`,
      heapUsedThreshold: `${heapUsedThresholdMB}MB`,
      rssThreshold: `${rssThresholdMB}MB`,
    };

    if (!isHeapHealthy || !isRssHealthy) {
      const issues: string[] = [];
      if (!isHeapHealthy) {
        issues.push(`Heap used (${heapUsedMB}MB) exceeds threshold (${heapUsedThresholdMB}MB)`);
      }
      if (!isRssHealthy) {
        issues.push(`RSS (${rssMB}MB) exceeds threshold (${rssThresholdMB}MB)`);
      }

      this.logger.warn(`Memory health check warning: ${issues.join(', ')}`);

      const result = this.getStatus(key, false, {
        ...memoryDetails,
        issues,
      });

      throw new HealthCheckError('Memory health check failed', result);
    }

    return this.getStatus(key, true, memoryDetails);
  }
}
