import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(StripeHealthIndicator.name);
  private stripe: Stripe | null = null;
  private cachedResult: { result: HealthIndicatorResult; timestamp: number } | null = null;
  private readonly cacheTtlMs = 60_000;

  constructor(private readonly configService: ConfigService) {
    super();
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.stripe) {
      const result = this.getStatus(key, false, {
        message: 'Stripe secret key not configured',
      });
      throw new HealthCheckError('Stripe health check failed', result);
    }

    // Return cached result if within TTL
    if (
      this.cachedResult &&
      Date.now() - this.cachedResult.timestamp < this.cacheTtlMs
    ) {
      return this.cachedResult.result;
    }

    try {
      const balance = await this.stripe.balance.retrieve();
      const result = this.getStatus(key, true, {
        livemode: balance.livemode,
      });

      this.cachedResult = { result, timestamp: Date.now() };
      return result;
    } catch (error) {
      this.logger.error(
        `Stripe health check failed: ${(error as Error).message}`,
      );
      const result = this.getStatus(key, false, {
        message: (error as Error).message,
      });
      throw new HealthCheckError('Stripe health check failed', result);
    }
  }
}
