import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketplaceSubscriptionsRepository } from '../marketplace-subscriptions.repository';
import { CreditsService } from './credits.service';
import { StripeService } from '../../stripe/stripe.service';
import { CreateMarketplaceSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';
import { ChangePlanDto } from '../dto/change-plan.dto';
import {
  MarketplaceSubscription,
  MarketplaceSubscriptionStatus,
  BillingPeriod,
} from '../../../entities/marketplace-subscription.entity';
import { MarketplacePlanSlug } from '../../../entities/marketplace-plan.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly repo: MarketplaceSubscriptionsRepository,
    private readonly creditsService: CreditsService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Subscribe a user to a marketplace plan
   */
  async subscribeToPlan(
    userId: string,
    dto: CreateMarketplaceSubscriptionDto,
  ): Promise<{ subscription?: MarketplaceSubscription; checkoutUrl?: string }> {
    // Validate the plan exists and is active
    const plan = await this.repo.findPlanById(dto.planId);
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or is not active');
    }

    // Check for existing active subscription
    const existingSub = await this.repo.findActiveSubscriptionByUserId(userId);
    if (existingSub) {
      throw new BadRequestException(
        'You already have an active marketplace subscription. Please cancel or change your current plan first.',
      );
    }

    // Handle FREE plan - create subscription directly
    if (plan.slug === MarketplacePlanSlug.FREE) {
      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const subscription = await this.repo.createSubscription({
        userId,
        planId: plan.id,
        status: MarketplaceSubscriptionStatus.ACTIVE,
        billingPeriod: BillingPeriod.MONTHLY,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        creditsRemaining: plan.monthlyCredits,
        creditsUsedThisPeriod: 0,
        totalCreditsUsed: 0,
        rolloverCreditsAmount: 0,
        cancelAtPeriodEnd: false,
      });

      this.logger.log(`Created FREE marketplace subscription for user ${userId}`);
      return { subscription };
    }

    // For paid plans, create a Stripe Checkout Session
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customerId = await this.stripeService.ensureCustomer(user);

    const priceId =
      dto.billingPeriod === BillingPeriod.ANNUAL
        ? plan.stripePriceIdAnnual
        : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new BadRequestException('No Stripe price configured for this plan and billing period');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const successUrl = dto.successUrl || `${frontendUrl}/marketplace/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = dto.cancelUrl || `${frontendUrl}/marketplace/subscription/cancel`;

    const session = await this.stripeService.getStripeClient().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'marketplace_subscription',
        planId: plan.id,
        userId,
        billingPeriod: dto.billingPeriod,
      },
      subscription_data: {
        metadata: {
          type: 'marketplace_subscription',
          planId: plan.id,
          userId,
        },
        trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
      },
    });

    this.logger.log(
      `Created Stripe checkout session ${session.id} for marketplace subscription, user ${userId}, plan ${plan.slug}`,
    );

    return { checkoutUrl: session.url || undefined };
  }

  /**
   * Get the current user's active subscription
   */
  async getMySubscription(userId: string): Promise<MarketplaceSubscription | null> {
    return this.repo.findActiveSubscriptionByUserId(userId);
  }

  /**
   * Cancel a marketplace subscription
   */
  async cancelSubscription(userId: string, dto: CancelSubscriptionDto): Promise<MarketplaceSubscription> {
    const subscription = await this.repo.findActiveSubscriptionByUserId(userId);
    if (!subscription) {
      throw new NotFoundException('No active marketplace subscription found');
    }

    if (dto.immediate) {
      // Cancel immediately
      if (subscription.stripeSubscriptionId) {
        await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
      }

      await this.handleSubscriptionLapse(subscription);

      const updated = await this.repo.findSubscriptionById(subscription.id);
      this.logger.log(`Marketplace subscription ${subscription.id} canceled immediately for user ${userId}`);
      return updated!;
    }

    // Cancel at period end
    if (subscription.stripeSubscriptionId) {
      await this.stripeService.getStripeClient().subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: true },
      );
    }

    const updated = await this.repo.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: true,
    });

    this.logger.log(`Marketplace subscription ${subscription.id} set to cancel at period end for user ${userId}`);
    return updated!;
  }

  /**
   * Pause a marketplace subscription
   */
  async pauseSubscription(userId: string): Promise<MarketplaceSubscription> {
    const subscription = await this.repo.findActiveSubscriptionByUserId(userId);
    if (!subscription) {
      throw new NotFoundException('No active marketplace subscription found');
    }

    if (subscription.status === MarketplaceSubscriptionStatus.PAUSED) {
      throw new BadRequestException('Subscription is already paused');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.getStripeClient().subscriptions.update(
        subscription.stripeSubscriptionId,
        { pause_collection: { behavior: 'mark_uncollectible' } },
      );
    }

    const updated = await this.repo.updateSubscription(subscription.id, {
      status: MarketplaceSubscriptionStatus.PAUSED,
      pausedAt: new Date(),
    });

    this.logger.log(`Marketplace subscription ${subscription.id} paused for user ${userId}`);
    return updated!;
  }

  /**
   * Resume a paused marketplace subscription
   */
  async resumeSubscription(userId: string): Promise<MarketplaceSubscription> {
    const subscription = await this.repo.findActiveSubscriptionByUserId(userId);
    if (!subscription) {
      throw new NotFoundException('No active marketplace subscription found');
    }

    if (subscription.status !== MarketplaceSubscriptionStatus.PAUSED) {
      throw new BadRequestException('Subscription is not paused');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.getStripeClient().subscriptions.update(
        subscription.stripeSubscriptionId,
        { pause_collection: '' as any },
      );
    }

    const updated = await this.repo.updateSubscription(subscription.id, {
      status: MarketplaceSubscriptionStatus.ACTIVE,
      pausedAt: undefined,
    });

    await this.repo.reactivateDownloadsForSubscription(subscription.id);

    this.logger.log(`Marketplace subscription ${subscription.id} resumed for user ${userId}`);
    return updated!;
  }

  /**
   * Change the plan for an existing subscription
   */
  async changePlan(userId: string, dto: ChangePlanDto): Promise<MarketplaceSubscription> {
    const subscription = await this.repo.findActiveSubscriptionByUserId(userId);
    if (!subscription) {
      throw new NotFoundException('No active marketplace subscription found');
    }

    const newPlan = await this.repo.findPlanById(dto.newPlanId);
    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('New plan not found or is not active');
    }

    if (subscription.planId === dto.newPlanId) {
      throw new BadRequestException('You are already on this plan');
    }

    const billingPeriod = dto.billingPeriod || subscription.billingPeriod;

    // If the subscription has a Stripe ID, update it through Stripe
    if (subscription.stripeSubscriptionId) {
      const priceId =
        billingPeriod === BillingPeriod.ANNUAL
          ? newPlan.stripePriceIdAnnual
          : newPlan.stripePriceIdMonthly;

      if (!priceId) {
        throw new BadRequestException('No Stripe price configured for the new plan');
      }

      const stripeSubscription = await this.stripeService.getSubscription(
        subscription.stripeSubscriptionId,
      );

      await this.stripeService.getStripeClient().subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: priceId,
            },
          ],
          metadata: {
            type: 'marketplace_subscription',
            planId: newPlan.id,
            userId,
          },
          proration_behavior: 'create_prorations',
        },
      );
    }

    // Update local subscription
    const creditsDiff = newPlan.monthlyCredits - (subscription.plan?.monthlyCredits || 0);
    const newCredits = Math.max(0, subscription.creditsRemaining + creditsDiff);

    const updated = await this.repo.updateSubscription(subscription.id, {
      planId: newPlan.id,
      billingPeriod,
      creditsRemaining: newCredits,
      cancelAtPeriodEnd: false,
    });

    this.logger.log(
      `Marketplace subscription ${subscription.id} changed to plan ${newPlan.slug} for user ${userId}`,
    );

    return updated!;
  }

  /**
   * Handle subscription lapse (canceled/expired)
   */
  async handleSubscriptionLapse(subscription: MarketplaceSubscription): Promise<void> {
    await this.repo.updateSubscription(subscription.id, {
      status: MarketplaceSubscriptionStatus.CANCELED,
    });

    await this.repo.deactivateDownloadsForSubscription(subscription.id);

    this.logger.log(`Marketplace subscription ${subscription.id} lapsed — downloads deactivated`);
  }

  /**
   * Reactivate a subscription (e.g., after payment recovery)
   */
  async reactivateSubscription(subscription: MarketplaceSubscription): Promise<void> {
    await this.repo.updateSubscription(subscription.id, {
      status: MarketplaceSubscriptionStatus.ACTIVE,
    });

    await this.repo.reactivateDownloadsForSubscription(subscription.id);

    this.logger.log(`Marketplace subscription ${subscription.id} reactivated — downloads restored`);
  }
}
