import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MarketplaceSubscriptionsRepository } from '../marketplace-subscriptions.repository';
import { CreditsService } from './credits.service';
import {
  MarketplaceSubscription,
  MarketplaceSubscriptionStatus,
} from '../../../entities/marketplace-subscription.entity';
import { AccessLevel } from '../../../entities/marketplace-plan.entity';
import { DigitalProduct } from '../../../entities/digital-product.entity';
import { SubscriptionDownload } from '../../../entities/subscription-download.entity';
import { PaginatedResponse } from '../../../common/interfaces/response.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionDownloadsService {
  private readonly logger = new Logger(SubscriptionDownloadsService.name);

  constructor(
    private readonly repo: MarketplaceSubscriptionsRepository,
    private readonly creditsService: CreditsService,
  ) {}

  /**
   * Download a product using subscription credits
   */
  async downloadWithCredits(
    userId: string,
    productId: string,
  ): Promise<{
    download: SubscriptionDownload;
    creditsUsed: number;
    creditsRemaining: number;
  }> {
    // Verify active subscription
    const subscription = await this.repo.findActiveSubscriptionByUserId(userId);
    if (!subscription) {
      throw new NotFoundException('No active marketplace subscription found');
    }

    if (
      subscription.status !== MarketplaceSubscriptionStatus.ACTIVE &&
      subscription.status !== MarketplaceSubscriptionStatus.TRIALING
    ) {
      throw new BadRequestException('Your subscription is not currently active');
    }

    // Verify product exists
    const product = await this.repo.findDigitalProductById(productId);
    if (!product) {
      throw new NotFoundException('Digital product not found');
    }

    // Check if user has already downloaded this product (free re-download)
    const alreadyDownloaded = await this.repo.hasUserDownloadedProduct(userId, productId);
    if (alreadyDownloaded) {
      // Return existing download without charging credits
      const existingDownloads = await this.repo.findSubscriptionDownloads(userId, undefined, 1);
      const existingDownload = existingDownloads.items.find(
        (d) => d.digitalProductId === productId,
      );

      if (existingDownload) {
        this.logger.log(
          `User ${userId} re-downloading product ${productId} — no credits charged`,
        );
        return {
          download: existingDownload,
          creditsUsed: 0,
          creditsRemaining: subscription.creditsRemaining,
        };
      }
    }

    // Check access level
    if (!this.canAccessProduct(subscription, product)) {
      throw new BadRequestException(
        'Your subscription plan does not include access to this product tier',
      );
    }

    // Calculate credit cost
    const creditsCost = this.creditsService.calculateCreditCost(
      product.price,
      subscription.plan?.accessLevel || AccessLevel.FREE,
    );

    // Deduct credits (handles concurrency with transaction)
    let newBalance = subscription.creditsRemaining;
    if (creditsCost > 0) {
      const txn = await this.creditsService.deductCredits(
        subscription.id,
        userId,
        productId,
        creditsCost,
        `Download: ${product.title}`,
      );
      newBalance = txn.balance;
    }

    // Create download record
    const downloadToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour download window

    const download = await this.repo.createSubscriptionDownload({
      subscriptionId: subscription.id,
      userId,
      digitalProductId: productId,
      creditsCost,
      downloadedAt: new Date(),
      licenseType: 'subscription',
      isActive: true,
      downloadToken,
      expiresAt,
    });

    this.logger.log(
      `User ${userId} downloaded product ${productId} for ${creditsCost} credits. Remaining: ${newBalance}`,
    );

    return {
      download,
      creditsUsed: creditsCost,
      creditsRemaining: newBalance,
    };
  }

  /**
   * Get a user's download history
   */
  async getMyDownloads(
    userId: string,
    cursor?: string,
    limit?: number,
  ): Promise<PaginatedResponse<SubscriptionDownload>> {
    return this.repo.findSubscriptionDownloads(userId, cursor, limit);
  }

  /**
   * Check if a subscription's access level permits access to a product
   */
  canAccessProduct(subscription: MarketplaceSubscription, product: DigitalProduct): boolean {
    const accessLevel = subscription.plan?.accessLevel || AccessLevel.FREE;

    // ALL access level can access everything
    if (accessLevel === AccessLevel.ALL) {
      return true;
    }

    const price = Number(product.price);

    switch (accessLevel) {
      case AccessLevel.FREE:
        return price <= 0;
      case AccessLevel.STANDARD:
        return price <= 75;
      case AccessLevel.PREMIUM:
        return price <= 150;
      default:
        return false;
    }
  }
}
