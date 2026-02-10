import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { MemoryHealthIndicator } from './indicators/memory.indicator';
import { StripeHealthIndicator } from './indicators/stripe.indicator';
import { StorageHealthIndicator } from './indicators/storage.indicator';
import { EmailHealthIndicator } from './indicators/email.indicator';

@Module({
  imports: [
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    MemoryHealthIndicator,
    StripeHealthIndicator,
    StorageHealthIndicator,
    EmailHealthIndicator,
  ],
  exports: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    MemoryHealthIndicator,
    StripeHealthIndicator,
    StorageHealthIndicator,
    EmailHealthIndicator,
  ],
})
export class HealthModule {}
