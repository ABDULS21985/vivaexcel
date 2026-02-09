import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { MemoryHealthIndicator } from './indicators/memory.indicator';

@Module({
  imports: [
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    MemoryHealthIndicator,
  ],
  exports: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    MemoryHealthIndicator,
  ],
})
export class HealthModule {}
