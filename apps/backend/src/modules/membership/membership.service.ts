import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipTier } from '../../entities/membership-tier.entity';
import {
  Subscription,
  SubscriptionStatus,
} from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import {
  CreateMembershipTierDto,
  UpdateMembershipTierDto,
} from './dto/membership-tier.dto';
import { MembershipTierLevel } from '../../entities/post.entity';
import { ApiResponse } from '../../common/interfaces/response.interface';

/**
 * Ordered tier levels from lowest to highest for comparison.
 */
const TIER_RANK: Record<string, number> = {
  [MembershipTierLevel.FREE]: 0,
  [MembershipTierLevel.BASIC]: 1,
  [MembershipTierLevel.PRO]: 2,
  [MembershipTierLevel.PREMIUM]: 3,
};

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    @InjectRepository(MembershipTier)
    private readonly tierRepository: Repository<MembershipTier>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ──────────────────────────────────────────────
  //  Tier operations
  // ──────────────────────────────────────────────

  async findAllActiveTiers(): Promise<ApiResponse<MembershipTier[]>> {
    const tiers = await this.tierRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    return {
      status: 'success',
      message: 'Membership tiers retrieved successfully',
      data: tiers,
    };
  }

  async createTier(
    dto: CreateMembershipTierDto,
  ): Promise<ApiResponse<MembershipTier>> {
    const existing = await this.tierRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(
        `Membership tier with slug "${dto.slug}" already exists`,
      );
    }

    const tier = this.tierRepository.create(dto);
    const saved = await this.tierRepository.save(tier);

    return {
      status: 'success',
      message: 'Membership tier created successfully',
      data: saved,
    };
  }

  async updateTier(
    id: string,
    dto: UpdateMembershipTierDto,
  ): Promise<ApiResponse<MembershipTier>> {
    const tier = await this.tierRepository.findOne({ where: { id } });
    if (!tier) {
      throw new NotFoundException(`Membership tier with ID "${id}" not found`);
    }

    Object.assign(tier, dto);
    const saved = await this.tierRepository.save(tier);

    return {
      status: 'success',
      message: 'Membership tier updated successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Subscription operations
  // ──────────────────────────────────────────────

  async subscribe(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<ApiResponse<Subscription>> {
    const tier = await this.tierRepository.findOne({
      where: { id: dto.tierId, isActive: true },
    });
    if (!tier) {
      throw new NotFoundException(
        `Active membership tier with ID "${dto.tierId}" not found`,
      );
    }

    // Check for existing active subscription
    const existing = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (existing) {
      throw new BadRequestException(
        'User already has an active subscription. Cancel the current one first or change the tier.',
      );
    }

    // In a real implementation, the Stripe API would be called here to create
    // the customer / subscription. For now we create a local record.
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = this.subscriptionRepository.create({
      userId,
      tierId: dto.tierId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    });

    const saved = await this.subscriptionRepository.save(subscription);

    // Reload with relations
    const result = await this.subscriptionRepository.findOne({
      where: { id: saved.id },
      relations: ['tier'],
    });

    this.logger.log(
      `User ${userId} subscribed to tier "${tier.name}" (${tier.slug})`,
    );

    return {
      status: 'success',
      message: 'Subscription created successfully',
      data: result!,
    };
  }

  async cancelSubscription(userId: string): Promise<ApiResponse<Subscription>> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      relations: ['tier'],
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // Mark for cancellation at the end of the current period
    subscription.cancelAtPeriodEnd = true;
    subscription.status = SubscriptionStatus.CANCELED;
    const saved = await this.subscriptionRepository.save(subscription);

    this.logger.log(`User ${userId} canceled subscription ${saved.id}`);

    return {
      status: 'success',
      message: 'Subscription canceled successfully. Access continues until the end of the current billing period.',
      data: saved,
    };
  }

  async getSubscriptionStatus(
    userId: string,
  ): Promise<ApiResponse<Subscription | null>> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
      relations: ['tier'],
      order: { createdAt: 'DESC' },
    });

    return {
      status: 'success',
      message: subscription
        ? 'Subscription status retrieved successfully'
        : 'No subscription found',
      data: subscription ?? null,
    };
  }

  /**
   * Handle Stripe webhook events.
   * In production this should validate the webhook signature and
   * process various event types (invoice.paid, customer.subscription.updated, etc.).
   */
  async handleWebhook(payload: Record<string, any>): Promise<ApiResponse<null>> {
    const eventType: string = payload?.type ?? '';
    this.logger.log(`Received Stripe webhook event: ${eventType}`);

    switch (eventType) {
      case 'customer.subscription.updated': {
        const stripeSubscriptionId: string =
          payload?.data?.object?.id ?? '';
        if (stripeSubscriptionId) {
          const subscription = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId },
          });
          if (subscription) {
            const stripeStatus: string =
              payload?.data?.object?.status ?? '';
            subscription.status = this.mapStripeStatus(stripeStatus);
            subscription.currentPeriodStart = new Date(
              (payload?.data?.object?.current_period_start ?? 0) * 1000,
            );
            subscription.currentPeriodEnd = new Date(
              (payload?.data?.object?.current_period_end ?? 0) * 1000,
            );
            subscription.cancelAtPeriodEnd =
              payload?.data?.object?.cancel_at_period_end ?? false;
            await this.subscriptionRepository.save(subscription);
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const stripeSubscriptionId: string =
          payload?.data?.object?.id ?? '';
        if (stripeSubscriptionId) {
          const subscription = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId },
          });
          if (subscription) {
            subscription.status = SubscriptionStatus.CANCELED;
            await this.subscriptionRepository.save(subscription);
          }
        }
        break;
      }
      default:
        this.logger.debug(`Unhandled webhook event type: ${eventType}`);
        break;
    }

    return {
      status: 'success',
      message: 'Webhook processed',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Helpers (exported for use by other modules)
  // ──────────────────────────────────────────────

  /**
   * Check whether a user's active subscription meets the required tier.
   * Returns `true` when the user's tier is equal to or above `requiredTier`.
   */
  async userHasTierAccess(
    userId: string,
    requiredTier: MembershipTierLevel,
  ): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      relations: ['tier'],
    });

    if (!subscription?.tier) {
      return requiredTier === MembershipTierLevel.FREE;
    }

    const userTierSlug = subscription.tier.slug;
    const userRank = TIER_RANK[userTierSlug] ?? 0;
    const requiredRank = TIER_RANK[requiredTier] ?? 0;

    return userRank >= requiredRank;
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELED,
      past_due: SubscriptionStatus.PAST_DUE,
      trialing: SubscriptionStatus.TRIALING,
      incomplete: SubscriptionStatus.INCOMPLETE,
    };
    return statusMap[stripeStatus] ?? SubscriptionStatus.INCOMPLETE;
  }
}
