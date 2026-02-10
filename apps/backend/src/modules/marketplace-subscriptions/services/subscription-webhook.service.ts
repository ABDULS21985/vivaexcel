import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import Stripe from 'stripe';
import { MarketplaceSubscriptionsRepository } from '../marketplace-subscriptions.repository';
import { CreditsService } from './credits.service';
import { SubscriptionsService } from './subscriptions.service';
import {
  MarketplaceSubscriptionStatus,
  BillingPeriod,
} from '../../../entities/marketplace-subscription.entity';

@Injectable()
export class SubscriptionWebhookService {
  private readonly logger = new Logger(SubscriptionWebhookService.name);

  constructor(
    private readonly repo: MarketplaceSubscriptionsRepository,
    private readonly creditsService: CreditsService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Handle checkout.session.completed for marketplace subscriptions
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { planId, userId, billingPeriod } = session.metadata || {};
    const stripeSubscriptionId = session.subscription as string;
    const stripeCustomerId = session.customer as string;

    if (!planId || !userId || !stripeSubscriptionId) {
      this.logger.warn(
        'Marketplace subscription checkout missing required metadata',
      );
      return;
    }

    // Idempotency check — don't create duplicate subscriptions
    const existing = await this.repo.findSubscriptionByStripeId(stripeSubscriptionId);
    if (existing) {
      this.logger.log(
        `Marketplace subscription already exists for Stripe subscription ${stripeSubscriptionId} — skipping`,
      );
      return;
    }

    const plan = await this.repo.findPlanById(planId);
    if (!plan) {
      this.logger.warn(`Plan ${planId} not found during checkout completion`);
      return;
    }

    const now = new Date();
    const periodEnd = new Date();
    if (billingPeriod === BillingPeriod.ANNUAL) {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const status =
      plan.trialDays > 0
        ? MarketplaceSubscriptionStatus.TRIALING
        : MarketplaceSubscriptionStatus.ACTIVE;

    const subscription = await this.repo.createSubscription({
      userId,
      planId: plan.id,
      stripeSubscriptionId,
      stripeCustomerId,
      status,
      billingPeriod: (billingPeriod as BillingPeriod) || BillingPeriod.MONTHLY,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      creditsRemaining: plan.monthlyCredits,
      creditsUsedThisPeriod: 0,
      totalCreditsUsed: 0,
      rolloverCreditsAmount: 0,
      cancelAtPeriodEnd: false,
      trialEndsAt: plan.trialDays > 0 ? new Date(Date.now() + plan.trialDays * 86400000) : undefined,
    });

    this.logger.log(
      `Created marketplace subscription ${subscription.id} for user ${userId}, plan ${plan.slug}, Stripe sub ${stripeSubscriptionId}`,
    );
  }

  /**
   * Handle customer.subscription.updated for marketplace subscriptions
   */
  async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.repo.findSubscriptionByStripeId(stripeSubscription.id);
    if (!subscription) {
      this.logger.warn(
        `No marketplace subscription found for Stripe subscription: ${stripeSubscription.id}`,
      );
      return;
    }

    const statusMap: Record<string, MarketplaceSubscriptionStatus> = {
      active: MarketplaceSubscriptionStatus.ACTIVE,
      canceled: MarketplaceSubscriptionStatus.CANCELED,
      past_due: MarketplaceSubscriptionStatus.PAST_DUE,
      trialing: MarketplaceSubscriptionStatus.TRIALING,
      paused: MarketplaceSubscriptionStatus.PAUSED,
    };

    const newStatus =
      statusMap[stripeSubscription.status] || MarketplaceSubscriptionStatus.EXPIRED;

    await this.repo.updateSubscription(subscription.id, {
      status: newStatus,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });

    // If subscription was reactivated from past_due
    if (
      subscription.status === MarketplaceSubscriptionStatus.PAST_DUE &&
      newStatus === MarketplaceSubscriptionStatus.ACTIVE
    ) {
      await this.subscriptionsService.reactivateSubscription(subscription);
    }

    this.logger.log(
      `Marketplace subscription ${subscription.id} updated to status: ${newStatus}`,
    );
  }

  /**
   * Handle customer.subscription.deleted for marketplace subscriptions
   */
  async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.repo.findSubscriptionByStripeId(stripeSubscription.id);
    if (!subscription) {
      this.logger.warn(
        `No marketplace subscription found for Stripe subscription: ${stripeSubscription.id}`,
      );
      return;
    }

    await this.subscriptionsService.handleSubscriptionLapse(subscription);

    this.logger.log(
      `Marketplace subscription ${subscription.id} deleted (Stripe: ${stripeSubscription.id})`,
    );
  }

  /**
   * Handle invoice.payment_succeeded — grant monthly credits on billing cycle renewal
   */
  async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const stripeSubscriptionId = invoice.subscription as string;
    if (!stripeSubscriptionId) {
      return;
    }

    const subscription = await this.repo.findSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
      return;
    }

    // Only grant credits if this is a renewal (not the first invoice)
    if (invoice.billing_reason === 'subscription_cycle') {
      await this.creditsService.grantMonthlyCredits(subscription);
      this.logger.log(
        `Monthly credits granted for marketplace subscription ${subscription.id} on payment cycle`,
      );
    }
  }

  /**
   * Handle invoice.payment_failed — update subscription to PAST_DUE
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const stripeSubscriptionId = invoice.subscription as string;
    if (!stripeSubscriptionId) {
      return;
    }

    const subscription = await this.repo.findSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
      return;
    }

    await this.repo.updateSubscription(subscription.id, {
      status: MarketplaceSubscriptionStatus.PAST_DUE,
    });

    this.logger.log(
      `Marketplace subscription ${subscription.id} marked as PAST_DUE due to payment failure`,
    );
  }
}
