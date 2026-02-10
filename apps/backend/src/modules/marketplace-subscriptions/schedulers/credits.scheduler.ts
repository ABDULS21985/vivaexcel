import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketplaceSubscriptionsRepository } from '../marketplace-subscriptions.repository';
import { CreditsService } from '../services/credits.service';

@Injectable()
export class CreditsScheduler {
  private readonly logger = new Logger(CreditsScheduler.name);
  private isProcessing = false;

  constructor(
    private readonly repo: MarketplaceSubscriptionsRepository,
    private readonly creditsService: CreditsService,
  ) {}

  /**
   * Runs every hour to check for subscriptions whose period has ended.
   * Grants monthly credits and resets the billing cycle for eligible subscriptions.
   * Uses an in-memory lock to prevent overlapping executions.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCreditRenewal(): Promise<void> {
    // Prevent overlapping executions
    if (this.isProcessing) {
      this.logger.debug('Skipping credit renewal check - previous run still in progress');
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.debug('Checking for expired subscription periods...');

      const expiredSubscriptions = await this.repo.findExpiredSubscriptions();

      if (expiredSubscriptions.length === 0) {
        this.logger.debug('No expired subscription periods found');
        return;
      }

      this.logger.log(`Found ${expiredSubscriptions.length} subscriptions due for credit renewal`);

      for (const subscription of expiredSubscriptions) {
        try {
          await this.creditsService.grantMonthlyCredits(subscription);
          this.logger.log(`Credits renewed for subscription ${subscription.id}`);
        } catch (error) {
          this.logger.error(
            `Failed to renew credits for subscription ${subscription.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Error processing credit renewals',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
