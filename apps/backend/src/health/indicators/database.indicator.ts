import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(DatabaseHealthIndicator.name);

  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.dataSource.isInitialized) {
        throw new Error('Database connection not initialized');
      }

      // Execute a simple query to verify database connectivity
      await this.dataSource.query('SELECT 1');

      return this.getStatus(key, true, {
        database: this.dataSource.options.database,
        type: this.dataSource.options.type,
      });
    } catch (error) {
      this.logger.error(`Database health check failed: ${(error as Error).message}`);

      const result = this.getStatus(key, false, {
        message: (error as Error).message,
      });

      throw new HealthCheckError('Database health check failed', result);
    }
  }
}
