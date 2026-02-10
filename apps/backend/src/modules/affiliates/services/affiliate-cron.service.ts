import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { AffiliateStatus } from '../../../entities/affiliate-profile.entity';
import { PayoutSchedule } from '../../../entities/seller-profile.entity';
import { OrderStatus } from '../../../entities/order.entity';
import { CommissionStatus } from '../../../entities/affiliate-commission.entity';
import { AffiliatesRepository } from '../affiliates.repository';
import { AffiliatePayoutService } from './affiliate-payout.service';

@Injectable()
export class AffiliateCronService {
  private readonly logger = new Logger(AffiliateCronService.name);

  constructor(
    private readonly repository: AffiliatesRepository,
    private readonly payoutService: AffiliatePayoutService,
  ) {}

  /**
   * Auto-approve commissions older than 30 days (past refund window).
   * Runs daily at 2:00 AM UTC.
   */
  @Cron('0 2 * * *')
  async autoApproveCommissions() {
    this.logger.log('Running auto-approve commissions CRON...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pendingCommissions = await this.repository.findPendingCommissionsOlderThan(thirtyDaysAgo);

    let approved = 0;
    for (const commission of pendingCommissions) {
      // Only approve if the order is still completed (not refunded)
      if (commission.order && commission.order.status === OrderStatus.COMPLETED) {
        await this.repository.updateCommission(commission.id, {
          status: CommissionStatus.APPROVED,
          approvedAt: new Date(),
        });
        approved++;
      }
    }

    this.logger.log(`Auto-approved ${approved}/${pendingCommissions.length} commissions`);
  }

  /**
   * Process weekly payouts.
   * Runs every Monday at 3:00 AM UTC.
   */
  @Cron('0 3 * * 1')
  async processWeeklyPayouts() {
    await this.processPayoutsForSchedule(PayoutSchedule.WEEKLY);
  }

  /**
   * Process biweekly payouts.
   * Runs on 1st and 15th of each month at 3:00 AM UTC.
   */
  @Cron('0 3 1,15 * *')
  async processBiweeklyPayouts() {
    await this.processPayoutsForSchedule(PayoutSchedule.BIWEEKLY);
  }

  /**
   * Process monthly payouts.
   * Runs on the 1st of each month at 3:00 AM UTC.
   */
  @Cron('0 3 1 * *')
  async processMonthlyPayouts() {
    await this.processPayoutsForSchedule(PayoutSchedule.MONTHLY);
  }

  private async processPayoutsForSchedule(schedule: PayoutSchedule) {
    this.logger.log(`Processing ${schedule} payouts...`);

    const result = await this.repository.findAllAffiliates({
      limit: 1000,
    });

    const affiliates = result.items.filter(
      (a) =>
        a.status === AffiliateStatus.ACTIVE &&
        a.payoutSchedule === schedule &&
        a.stripeConnectAccountId &&
        a.stripeOnboardingComplete,
    );

    let processed = 0;
    let failed = 0;

    for (const affiliate of affiliates) {
      try {
        const availableAmount = await this.repository.sumApprovedUnpaidCommissions(affiliate.id);
        if (availableAmount >= Number(affiliate.payoutThreshold)) {
          const payout = await this.payoutService.createPayoutBatch(affiliate.id);
          await this.payoutService.processPayout(payout.id);
          processed++;
        }
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to process payout for affiliate ${affiliate.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    this.logger.log(`${schedule} payouts: ${processed} processed, ${failed} failed out of ${affiliates.length} eligible`);
  }
}
