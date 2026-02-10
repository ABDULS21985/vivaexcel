import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { RedisService } from '../../../shared/redis/redis.service';

interface SmokeTestResult {
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
}

@Injectable()
export class DeploymentVerificationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DeploymentVerificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  onApplicationBootstrap(): void {
    const runOnDeploy = this.configService.get<string>(
      'RUN_SMOKE_ON_DEPLOY',
      'false',
    );

    if (runOnDeploy === 'true') {
      setTimeout(async () => {
        this.logger.log('Running post-deploy smoke tests...');
        const results = await this.runSmokeTests();

        if (results.passed) {
          this.logger.log('All smoke tests passed');
        } else {
          this.logger.error('Smoke tests FAILED', JSON.stringify(results.results));

          const autoRollback = this.configService.get<string>(
            'AUTO_ROLLBACK_ENABLED',
            'false',
          );
          if (autoRollback === 'true') {
            this.logger.error(
              'AUTO_ROLLBACK_ENABLED: Exiting process to trigger container restart',
            );
            process.exit(1);
          }
        }

        // Store results in Redis
        try {
          const historyKey = 'deploy:smoke-results';
          const entry = JSON.stringify({
            timestamp: new Date().toISOString(),
            ...results,
          });
          await this.redisService.getClient().lpush(historyKey, entry);
          await this.redisService.getClient().ltrim(historyKey, 0, 49);
          await this.redisService.expire(historyKey, 7 * 24 * 60 * 60);
        } catch {
          // Non-critical
        }
      }, 10000);
    }
  }

  async runSmokeTests(): Promise<{
    passed: boolean;
    results: SmokeTestResult[];
  }> {
    const results: SmokeTestResult[] = [];
    const port = this.configService.get<number>('PORT', 4001);
    const baseUrl = `http://localhost:${port}`;

    // Test 1: Health ready endpoint
    results.push(await this.testEndpoint(`${baseUrl}/api/v1/health/ready`, 'Health ready check'));

    // Test 2: Digital products endpoint
    results.push(
      await this.testEndpoint(
        `${baseUrl}/api/v1/digital-products?limit=1`,
        'Digital products endpoint',
      ),
    );

    // Test 3: Metrics endpoint
    results.push(await this.testEndpoint(`${baseUrl}/api/v1/metrics`, 'Metrics endpoint'));

    // Test 4: Database migration status
    results.push(await this.testDatabaseMigrations());

    // Test 5: Redis health
    results.push(await this.testRedisHealth());

    const passed = results.every((r) => r.passed);
    return { passed, results };
  }

  private async testEndpoint(
    url: string,
    testName: string,
  ): Promise<SmokeTestResult> {
    const start = Date.now();
    try {
      const response = await fetch(url);
      const duration = Date.now() - start;
      if (response.ok) {
        return { test: testName, passed: true, duration };
      }
      return {
        test: testName,
        passed: false,
        duration,
        error: `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        test: testName,
        passed: false,
        duration: Date.now() - start,
        error: (error as Error).message,
      };
    }
  }

  private async testDatabaseMigrations(): Promise<SmokeTestResult> {
    const start = Date.now();
    try {
      const hasPending = await this.dataSource.showMigrations();
      const duration = Date.now() - start;
      return {
        test: 'Database migration status',
        passed: !hasPending,
        duration,
        ...(hasPending ? { error: 'Pending migrations found' } : {}),
      };
    } catch (error) {
      return {
        test: 'Database migration status',
        passed: false,
        duration: Date.now() - start,
        error: (error as Error).message,
      };
    }
  }

  private async testRedisHealth(): Promise<SmokeTestResult> {
    const start = Date.now();
    try {
      const healthy = await this.redisService.isHealthy();
      const duration = Date.now() - start;
      return {
        test: 'Redis health',
        passed: healthy,
        duration,
        ...(!healthy ? { error: 'Redis ping failed' } : {}),
      };
    } catch (error) {
      return {
        test: 'Redis health',
        passed: false,
        duration: Date.now() - start,
        error: (error as Error).message,
      };
    }
  }

  async getDeployHistory(): Promise<unknown[]> {
    try {
      const historyKey = 'deploy:smoke-results';
      const entries = await this.redisService.getClient().lrange(historyKey, 0, 49);
      return entries.map((e) => JSON.parse(e));
    } catch {
      return [];
    }
  }
}
