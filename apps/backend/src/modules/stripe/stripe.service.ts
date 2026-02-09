import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { EmailService } from '../email/email.service';
import { CheckoutService } from '../checkout/checkout.service';
import { StripeConnectService } from '../sellers/services/stripe-connect.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => CheckoutService))
    private readonly checkoutService: CheckoutService,
    @Inject(forwardRef(() => StripeConnectService))
    private readonly stripeConnectService: StripeConnectService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not configured. Stripe integration will not work.');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-02-24.acacia',
      });
    }

    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  getStripeClient(): Stripe {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe is not configured. Set STRIPE_SECRET_KEY.');
    }
    return this.stripe;
  }

  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.getStripeClient().customers.create({
        email,
        name,
        metadata: { source: 'ktblog' },
      });

      this.logger.log(`Stripe customer created: ${customer.id} for ${email}`);
      return customer;
    } catch (error) {
      this.logger.error(
        `Failed to create Stripe customer for ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to create payment customer');
    }
  }

  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.getStripeClient().checkout.sessions.create({
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
        subscription_data: {
          metadata: { source: 'ktblog' },
        },
      });

      this.logger.log(`Checkout session created: ${session.id} for customer ${customerId}`);
      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session for customer ${customerId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  /**
   * Create a Stripe Billing Portal session
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.getStripeClient().billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      this.logger.log(`Portal session created for customer ${customerId}`);
      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create portal session for customer ${customerId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to create portal session');
    }
  }

  /**
   * Cancel a Stripe subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.getStripeClient().subscriptions.cancel(subscriptionId);

      this.logger.log(`Subscription canceled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription ${subscriptionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }

  /**
   * Get a Stripe subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.getStripeClient().subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve subscription ${subscriptionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to retrieve subscription');
    }
  }

  /**
   * List all active prices
   */
  async listPrices(): Promise<Stripe.Price[]> {
    try {
      const prices = await this.getStripeClient().prices.list({
        active: true,
        expand: ['data.product'],
        limit: 100,
      });

      return prices.data;
    } catch (error) {
      this.logger.error(
        'Failed to list prices',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to list prices');
    }
  }

  /**
   * Handle incoming Stripe webhook events
   */
  async handleWebhookEvent(payload: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.getStripeClient().webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      this.logger.error(
        'Webhook signature verification failed',
        error instanceof Error ? error.message : String(error),
      );
      throw new BadRequestException('Webhook signature verification failed');
    }

    this.logger.log(`Processing webhook event: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Delegate digital product purchases to CheckoutService
        if (session.metadata?.type === 'digital_product_purchase') {
          await this.checkoutService.handleCheckoutComplete(session);
          break;
        }
        // Otherwise, handle as subscription checkout
        await this.handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const failedSession = event.data.object as Stripe.Checkout.Session;
        if (failedSession.metadata?.type === 'digital_product_purchase') {
          await this.checkoutService.handlePaymentFailed(failedSession);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.metadata?.type === 'digital_product_purchase') {
          await this.checkoutService.handleChargeRefunded(charge);
        }
        break;
      }

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await this.stripeConnectService.handleAccountUpdated(account);
        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer;
        await this.stripeConnectService.handleTransferFailed(transfer);
        break;
      }

      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Ensure a user has a Stripe customer ID, creating one if needed
   */
  async ensureCustomer(user: User): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.createCustomer(
      user.email,
      user.name || user.email,
    );

    await this.userRepository.update(user.id, {
      stripeCustomerId: customer.id,
    });

    return customer.id;
  }

  // ─── Private Webhook Handlers ───────────────────────────────────────

  /**
   * Handle checkout.session.completed: create/update subscription record
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!customerId || !subscriptionId) {
      this.logger.warn('Checkout session missing customer or subscription ID');
      return;
    }

    // Find user by Stripe customer ID
    const user = await this.userRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.warn(`No user found for Stripe customer: ${customerId}`);
      return;
    }

    // Retrieve the full subscription to get details
    const stripeSubscription = await this.getStripeClient().subscriptions.retrieve(subscriptionId);

    // Check if a subscription record already exists
    let subscription = await this.subscriptionRepository.findOne({
      where: { userId: user.id },
    });

    const periodStart = new Date(stripeSubscription.current_period_start * 1000);
    const periodEnd = new Date(stripeSubscription.current_period_end * 1000);

    if (subscription) {
      // Update existing subscription
      await this.subscriptionRepository.update(subscription.id, {
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
    } else {
      // Create new subscription record
      subscription = this.subscriptionRepository.create({
        userId: user.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
      await this.subscriptionRepository.save(subscription);
    }

    // Send subscription confirmed email
    const tierName = this.extractTierName(stripeSubscription);
    await this.emailService.sendSubscriptionConfirmed(
      { email: user.email, name: user.name || user.email },
      tierName,
    );

    this.logger.log(`Subscription created/updated for user ${user.id}: ${subscriptionId}`);
  }

  /**
   * Handle customer.subscription.updated: sync status changes
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscriptionId = stripeSubscription.id;

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`No local subscription found for Stripe subscription: ${subscriptionId}`);
      return;
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELED,
      past_due: SubscriptionStatus.PAST_DUE,
      trialing: SubscriptionStatus.TRIALING,
      incomplete: SubscriptionStatus.INCOMPLETE,
    };

    const newStatus = statusMap[stripeSubscription.status] || SubscriptionStatus.INCOMPLETE;

    await this.subscriptionRepository.update(subscription.id, {
      status: newStatus,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });

    this.logger.log(`Subscription ${subscriptionId} updated to status: ${newStatus}`);
  }

  /**
   * Handle customer.subscription.deleted: mark as canceled
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscriptionId = stripeSubscription.id;

    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`No local subscription found for Stripe subscription: ${subscriptionId}`);
      return;
    }

    await this.subscriptionRepository.update(subscription.id, {
      status: SubscriptionStatus.CANCELED,
    });

    this.logger.log(`Subscription ${subscriptionId} marked as canceled`);
  }

  /**
   * Handle invoice.payment_succeeded: log successful payment
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const amount = invoice.amount_paid;
    const currency = invoice.currency;

    this.logger.log(
      `Payment succeeded for customer ${customerId}: ${amount} ${currency?.toUpperCase()}`,
    );
  }

  /**
   * Handle invoice.payment_failed: notify user and update status
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;

    const user = await this.userRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.warn(`No user found for Stripe customer: ${customerId}`);
      return;
    }

    // Update subscription status to past_due
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId: user.id },
    });

    if (subscription) {
      await this.subscriptionRepository.update(subscription.id, {
        status: SubscriptionStatus.PAST_DUE,
      });
    }

    // Send payment failed email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    await this.emailService.sendPaymentFailed(
      { email: user.email, name: user.name || user.email },
      `${frontendUrl}/settings/billing`,
    );

    this.logger.log(`Payment failed notification sent to user ${user.id}`);
  }

  /**
   * Extract tier name from Stripe subscription product metadata
   */
  private extractTierName(stripeSubscription: Stripe.Subscription): string {
    const item = stripeSubscription.items?.data?.[0];
    if (item?.price?.product) {
      const product = item.price.product;
      if (typeof product === 'object' && 'name' in product) {
        return product.name;
      }
    }
    return 'Premium';
  }
}
