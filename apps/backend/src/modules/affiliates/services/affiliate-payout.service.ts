import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { AffiliatePayoutStatus } from '../../../entities/affiliate-payout.entity';
import { CommissionStatus } from '../../../entities/affiliate-commission.entity';
import { AffiliatesRepository } from '../affiliates.repository';
import { AffiliateStripeService } from './affiliate-stripe.service';
import { PayoutQueryDto } from '../dto/payout-query.dto';

@Injectable()
export class AffiliatePayoutService {
  private readonly logger = new Logger(AffiliatePayoutService.name);

  constructor(
    private readonly repository: AffiliatesRepository,
    private readonly stripeService: AffiliateStripeService,
  ) {}

  async getEarningsSummary(affiliateId: string) {
    const earnings = await this.repository.getAffiliateEarnings(affiliateId);
    const affiliate = await this.repository.findAffiliateById(affiliateId);

    return {
      pending: earnings.pending,
      available: earnings.approved,
      paid: earnings.paid,
      total: earnings.pending + earnings.approved + earnings.paid,
      paidBalance: affiliate ? Number(affiliate.paidBalance) : 0,
    };
  }

  async getMyPayouts(affiliateId: string, query: PayoutQueryDto) {
    return this.repository.findPayouts({ ...query, affiliateId });
  }

  async getAllPayouts(query: PayoutQueryDto) {
    return this.repository.findPayouts(query);
  }

  async createPayoutBatch(affiliateId: string) {
    const affiliate = await this.repository.findAffiliateById(affiliateId);
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    if (!affiliate.stripeConnectAccountId || !affiliate.stripeOnboardingComplete) {
      throw new BadRequestException('Stripe Connect account not set up');
    }

    const availableAmount = await this.repository.sumApprovedUnpaidCommissions(affiliateId);
    if (availableAmount < Number(affiliate.payoutThreshold)) {
      throw new BadRequestException(
        `Available balance ($${availableAmount.toFixed(2)}) is below minimum payout threshold ($${Number(affiliate.payoutThreshold).toFixed(2)})`,
      );
    }

    const commissions = await this.repository.findApprovedUnpaidCommissions(affiliateId);
    if (commissions.length === 0) {
      throw new BadRequestException('No approved commissions available for payout');
    }

    const payout = await this.repository.createPayout({
      affiliateId,
      amount: availableAmount,
      currency: 'USD',
      platformFee: 0,
      netAmount: availableAmount,
      status: AffiliatePayoutStatus.PENDING,
      periodStart: commissions[commissions.length - 1].createdAt,
      periodEnd: commissions[0].createdAt,
      commissionCount: commissions.length,
    });

    // Link commissions to this payout
    const commissionIds = commissions.map((c) => c.id);
    await this.repository.bulkUpdateCommissionStatus(commissionIds, CommissionStatus.APPROVED, {
      payoutId: payout.id,
    });

    this.logger.log(
      `Payout batch created: ${payout.id} for affiliate ${affiliateId}, $${availableAmount.toFixed(2)}, ${commissions.length} commissions`,
    );

    return payout;
  }

  async processPayout(payoutId: string) {
    const payout = await this.repository.findPayoutById(payoutId);
    if (!payout) throw new NotFoundException('Payout not found');

    if (payout.status !== AffiliatePayoutStatus.PENDING) {
      throw new BadRequestException(`Payout is already ${payout.status}`);
    }

    const affiliate = payout.affiliate;
    if (!affiliate?.stripeConnectAccountId) {
      throw new BadRequestException('Affiliate has no Stripe Connect account');
    }

    // Mark as processing
    await this.repository.updatePayout(payoutId, {
      status: AffiliatePayoutStatus.PROCESSING,
    });

    try {
      const amountCents = Math.round(Number(payout.netAmount) * 100);
      const transfer = await this.stripeService.createTransfer(
        affiliate.stripeConnectAccountId,
        amountCents,
        payout.currency,
        { payoutId: payout.id, affiliateId: affiliate.id },
      );

      // Mark as completed
      await this.repository.updatePayout(payoutId, {
        status: AffiliatePayoutStatus.COMPLETED,
        stripeTransferId: transfer.id,
        processedAt: new Date(),
      });

      // Update commission statuses to PAID
      if (payout.commissions && payout.commissions.length > 0) {
        const commissionIds = payout.commissions.map((c) => c.id);
        await this.repository.bulkUpdateCommissionStatus(commissionIds, CommissionStatus.PAID, {
          paidAt: new Date(),
        });
      }

      // Update affiliate paid balance
      await this.repository.updateAffiliateProfile(affiliate.id, {
        paidBalance: Number(affiliate.paidBalance) + Number(payout.netAmount),
        pendingBalance: Math.max(0, Number(affiliate.pendingBalance) - Number(payout.netAmount)),
      } as any);

      this.logger.log(`Payout ${payoutId} completed: transfer ${transfer.id}`);
      return this.repository.findPayoutById(payoutId);
    } catch (error) {
      await this.repository.updatePayout(payoutId, {
        status: AffiliatePayoutStatus.FAILED,
        failureReason: error instanceof Error ? error.message : 'Transfer failed',
      });

      this.logger.error(`Payout ${payoutId} failed`, error);
      throw error;
    }
  }
}
