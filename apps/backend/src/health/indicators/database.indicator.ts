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

      // Get active connections and database size
      let activeConnections: number | undefined;
      let databaseSizeMb: number | undefined;

      try {
        const [activityResult] = await this.dataSource.query(
          "SELECT count(*) as active FROM pg_stat_activity WHERE state = 'active'",
        );
        activeConnections = parseInt(activityResult?.active, 10);

        const [sizeResult] = await this.dataSource.query(
          'SELECT pg_database_size(current_database()) as size_bytes',
        );
        databaseSizeMb = Math.round(
          parseInt(sizeResult?.size_bytes, 10) / 1024 / 1024,
        );
      } catch {
        // Non-critical metadata, continue with basic health status
      }

      return this.getStatus(key, true, {
        database: this.dataSource.options.database,
        type: this.dataSource.options.type,
        ...(activeConnections !== undefined && {
          active_connections: activeConnections,
        }),
        ...(databaseSizeMb !== undefined && {
          database_size_mb: databaseSizeMb,
        }),
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
