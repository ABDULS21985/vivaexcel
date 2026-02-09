import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsletterService } from './newsletter.service';

@Injectable()
export class NewsletterScheduler {
  private readonly logger = new Logger(NewsletterScheduler.name);
  private isProcessing = false;

  constructor(private readonly newsletterService: NewsletterService) {}

  /**
   * Runs every minute to check for scheduled newsletters that are due.
   * Processes newsletters where scheduledFor <= now AND status = 'scheduled'.
   * Uses a lock to prevent overlapping executions.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledNewsletters(): Promise<void> {
    // Prevent overlapping executions
    if (this.isProcessing) {
      this.logger.debug('Skipping scheduled newsletter check - previous run still in progress');
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.debug('Checking for scheduled newsletters...');
      await this.newsletterService.processScheduledNewsletters();
    } catch (error) {
      this.logger.error(
        'Error processing scheduled newsletters',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
