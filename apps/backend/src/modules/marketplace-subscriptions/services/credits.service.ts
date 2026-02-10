import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MarketplaceSubscriptionsRepository } from '../marketplace-subscriptions.repository';
import {
  MarketplaceSubscription,
  MarketplaceSubscriptionStatus,
} from '../../../entities/marketplace-subscription.entity';
import { CreditTransaction, CreditTransactionType } from '../../../entities/credit-transaction.entity';
import { AccessLevel } from '../../../entities/marketplace-plan.entity';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private readonly repo: MarketplaceSubscriptionsRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Calculate credit cost based on product price and access level
   */
  calculateCreditCost(productPrice: number, accessLevel: AccessLevel): number {
    if (accessLevel === AccessLevel.ALL) {
      return 0;
    }

    const price = Number(productPrice);

    if (price <= 0) {
      return 0;
    }

    if (price <= 25) {
      return 1;
    }

    if (price <= 75) {
      return 2;
    }

    if (price <= 150) {
      return 3;
    }

    return 5;
  }

  /**
   * Deduct credits from a subscription using a database transaction with SELECT FOR UPDATE
   */
  async deductCredits(
    subscriptionId: string,
    userId: string,
    productId: string,
    creditsCost: number,
    description?: string,
  ): Promise<CreditTransaction> {
    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      // Lock the subscription row
      const subscription = await manager
        .createQueryBuilder(MarketplaceSubscription, 'sub')
        .setLock('pessimistic_write')
        .where('sub.id = :id', { id: subscriptionId })
        .getOne();

      if (!subscription) {
        throw new BadRequestException('Subscription not found');
      }

      if (
        subscription.status !== MarketplaceSubscriptionStatus.ACTIVE &&
        subscription.status !== MarketplaceSubscriptionStatus.TRIALING
      ) {
        throw new BadRequestException('Subscription is not active');
      }

      if (subscription.creditsRemaining < creditsCost) {
        throw new BadRequestException(
          `Insufficient credits. Required: ${creditsCost}, Available: ${subscription.creditsRemaining}`,
        );
      }

      // Deduct credits
      const newBalance = subscription.creditsRemaining - creditsCost;

      await manager.update(MarketplaceSubscription, subscriptionId, {
        creditsRemaining: newBalance,
        creditsUsedThisPeriod: subscription.creditsUsedThisPeriod + creditsCost,
        totalCreditsUsed: subscription.totalCreditsUsed + creditsCost,
      });

      // Create credit transaction record
      const transaction = manager.create(CreditTransaction, {
        subscriptionId,
        userId,
        type: CreditTransactionType.CREDIT_USED,
        amount: -creditsCost,
        balance: newBalance,
        digitalProductId: productId,
        description: description || `Credit used for product download`,
      });

      const savedTransaction = await manager.save(CreditTransaction, transaction);

      this.logger.log(
        `Deducted ${creditsCost} credits from subscription ${subscriptionId}. New balance: ${newBalance}`,
      );

      return savedTransaction;
    });
  }

  /**
   * Grant monthly credits to a subscription (handles rollover)
   */
  async grantMonthlyCredits(subscription: MarketplaceSubscription): Promise<void> {
    await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      // Lock the subscription row
      const sub = await manager
        .createQueryBuilder(MarketplaceSubscription, 'sub')
        .setLock('pessimistic_write')
        .leftJoinAndSelect('sub.plan', 'plan')
        .where('sub.id = :id', { id: subscription.id })
        .getOne();

      if (!sub || !sub.plan) {
        this.logger.warn(`Subscription ${subscription.id} or plan not found for credit grant`);
        return;
      }

      const plan = sub.plan;
      let rolloverAmount = 0;
      let expiredAmount = 0;

      // Handle rollover credits
      if (plan.rolloverCredits && sub.creditsRemaining > 0) {
        rolloverAmount = Math.min(sub.creditsRemaining, plan.maxRolloverCredits);
        expiredAmount = sub.creditsRemaining - rolloverAmount;

        if (rolloverAmount > 0) {
          const rolloverTxn = manager.create(CreditTransaction, {
            subscriptionId: sub.id,
            userId: sub.userId,
            type: CreditTransactionType.CREDIT_ROLLOVER,
            amount: 0,
            balance: rolloverAmount,
            description: `${rolloverAmount} credits rolled over from previous period`,
          });
          await manager.save(CreditTransaction, rolloverTxn);
        }

        if (expiredAmount > 0) {
          const expiredTxn = manager.create(CreditTransaction, {
            subscriptionId: sub.id,
            userId: sub.userId,
            type: CreditTransactionType.CREDIT_EXPIRED,
            amount: -expiredAmount,
            balance: rolloverAmount,
            description: `${expiredAmount} credits expired from previous period`,
          });
          await manager.save(CreditTransaction, expiredTxn);
        }
      } else {
        expiredAmount = sub.creditsRemaining;
        if (expiredAmount > 0) {
          const expiredTxn = manager.create(CreditTransaction, {
            subscriptionId: sub.id,
            userId: sub.userId,
            type: CreditTransactionType.CREDIT_EXPIRED,
            amount: -expiredAmount,
            balance: 0,
            description: `${expiredAmount} credits expired (no rollover)`,
          });
          await manager.save(CreditTransaction, expiredTxn);
        }
      }

      // Grant new monthly credits
      const newBalance = rolloverAmount + plan.monthlyCredits;

      const grantTxn = manager.create(CreditTransaction, {
        subscriptionId: sub.id,
        userId: sub.userId,
        type: CreditTransactionType.CREDIT_GRANT,
        amount: plan.monthlyCredits,
        balance: newBalance,
        description: `Monthly credit grant of ${plan.monthlyCredits} credits`,
      });
      await manager.save(CreditTransaction, grantTxn);

      // Calculate new period dates
      const newPeriodStart = new Date();
      const newPeriodEnd = new Date();
      if (sub.billingPeriod === 'annual') {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      } else {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      }

      // Update subscription
      await manager.update(MarketplaceSubscription, sub.id, {
        creditsRemaining: newBalance,
        rolloverCreditsAmount: rolloverAmount,
        creditsUsedThisPeriod: 0,
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
      });

      this.logger.log(
        `Granted ${plan.monthlyCredits} monthly credits to subscription ${sub.id}. ` +
          `Rollover: ${rolloverAmount}, Expired: ${expiredAmount}, New balance: ${newBalance}`,
      );
    });
  }

  /**
   * Refund credits back to a subscription
   */
  async refundCredits(
    subscriptionId: string,
    userId: string,
    productId: string,
    amount: number,
    description?: string,
  ): Promise<CreditTransaction> {
    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const subscription = await manager
        .createQueryBuilder(MarketplaceSubscription, 'sub')
        .setLock('pessimistic_write')
        .where('sub.id = :id', { id: subscriptionId })
        .getOne();

      if (!subscription) {
        throw new BadRequestException('Subscription not found');
      }

      const newBalance = subscription.creditsRemaining + amount;

      await manager.update(MarketplaceSubscription, subscriptionId, {
        creditsRemaining: newBalance,
        creditsUsedThisPeriod: Math.max(0, subscription.creditsUsedThisPeriod - amount),
        totalCreditsUsed: Math.max(0, subscription.totalCreditsUsed - amount),
      });

      const transaction = manager.create(CreditTransaction, {
        subscriptionId,
        userId,
        type: CreditTransactionType.CREDIT_REFUND,
        amount,
        balance: newBalance,
        digitalProductId: productId,
        description: description || `Credit refund for product`,
      });

      const savedTransaction = await manager.save(CreditTransaction, transaction);

      this.logger.log(
        `Refunded ${amount} credits to subscription ${subscriptionId}. New balance: ${newBalance}`,
      );

      return savedTransaction;
    });
  }

  /**
   * Get usage analytics for a user
   */
  async getUsageAnalytics(userId: string): Promise<{
    creditsRemaining: number;
    creditsUsedThisPeriod: number;
    totalCreditsUsed: number;
    monthlyCredits: number;
    utilizationRate: number;
    rolloverCredits: number;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
  }> {
    const subscription = await this.repo.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return {
        creditsRemaining: 0,
        creditsUsedThisPeriod: 0,
        totalCreditsUsed: 0,
        monthlyCredits: 0,
        utilizationRate: 0,
        rolloverCredits: 0,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      };
    }

    const monthlyCredits = subscription.plan?.monthlyCredits || 0;
    const utilizationRate =
      monthlyCredits > 0
        ? Math.round((subscription.creditsUsedThisPeriod / monthlyCredits) * 100)
        : 0;

    return {
      creditsRemaining: subscription.creditsRemaining,
      creditsUsedThisPeriod: subscription.creditsUsedThisPeriod,
      totalCreditsUsed: subscription.totalCreditsUsed,
      monthlyCredits,
      utilizationRate,
      rolloverCredits: subscription.rolloverCreditsAmount,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }
}
