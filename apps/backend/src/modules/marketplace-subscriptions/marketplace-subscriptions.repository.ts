import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MarketplacePlan } from '../../entities/marketplace-plan.entity';
import {
  MarketplaceSubscription,
  MarketplaceSubscriptionStatus,
} from '../../entities/marketplace-subscription.entity';
import { CreditTransaction } from '../../entities/credit-transaction.entity';
import { SubscriptionDownload } from '../../entities/subscription-download.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { User } from '../../entities/user.entity';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class MarketplaceSubscriptionsRepository {
  constructor(
    @InjectRepository(MarketplacePlan)
    private readonly planRepository: Repository<MarketplacePlan>,
    @InjectRepository(MarketplaceSubscription)
    private readonly subscriptionRepository: Repository<MarketplaceSubscription>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepository: Repository<CreditTransaction>,
    @InjectRepository(SubscriptionDownload)
    private readonly subscriptionDownloadRepository: Repository<SubscriptionDownload>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ──────────────────────────────────────────────
  //  Cursor helpers
  // ──────────────────────────────────────────────

  private encodeCursor(date: Date, id: string): string {
    return Buffer.from(`${date.toISOString()}|${id}`).toString('base64');
  }

  private decodeCursor(cursor: string): { date: Date; id: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      const [dateStr, id] = decoded.split('|');
      return { date: new Date(dateStr), id };
    } catch {
      return { date: new Date(), id: '' };
    }
  }

  // ──────────────────────────────────────────────
  //  Plan methods
  // ──────────────────────────────────────────────

  async findActivePlans(): Promise<MarketplacePlan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findPlanBySlug(slug: string): Promise<MarketplacePlan | null> {
    return this.planRepository.findOne({ where: { slug } });
  }

  async findPlanById(id: string): Promise<MarketplacePlan | null> {
    return this.planRepository.findOne({ where: { id } });
  }

  async createPlan(data: Partial<MarketplacePlan>): Promise<MarketplacePlan> {
    const plan = this.planRepository.create(data);
    return this.planRepository.save(plan);
  }

  async updatePlan(id: string, data: Partial<MarketplacePlan>): Promise<MarketplacePlan | null> {
    await this.planRepository.update(id, data);
    return this.planRepository.findOne({ where: { id } });
  }

  // ──────────────────────────────────────────────
  //  Subscription methods
  // ──────────────────────────────────────────────

  async findActiveSubscriptionByUserId(userId: string): Promise<MarketplaceSubscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        status: In([
          MarketplaceSubscriptionStatus.ACTIVE,
          MarketplaceSubscriptionStatus.TRIALING,
          MarketplaceSubscriptionStatus.PAST_DUE,
          MarketplaceSubscriptionStatus.PAUSED,
        ]),
      },
      relations: ['plan'],
    });
  }

  async findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<MarketplaceSubscription | null> {
    return this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
      relations: ['plan', 'user'],
    });
  }

  async findSubscriptionById(id: string): Promise<MarketplaceSubscription | null> {
    return this.subscriptionRepository.findOne({
      where: { id },
      relations: ['plan', 'user'],
    });
  }

  async createSubscription(data: Partial<MarketplaceSubscription>): Promise<MarketplaceSubscription> {
    const subscription = this.subscriptionRepository.create(data);
    return this.subscriptionRepository.save(subscription);
  }

  async updateSubscription(
    id: string,
    data: Partial<MarketplaceSubscription>,
  ): Promise<MarketplaceSubscription | null> {
    await this.subscriptionRepository.update(id, data);
    return this.subscriptionRepository.findOne({ where: { id }, relations: ['plan'] });
  }

  async findExpiredSubscriptions(): Promise<MarketplaceSubscription[]> {
    return this.subscriptionRepository
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.plan', 'plan')
      .where('sub.status IN (:...statuses)', {
        statuses: [MarketplaceSubscriptionStatus.ACTIVE, MarketplaceSubscriptionStatus.TRIALING],
      })
      .andWhere('sub.current_period_end <= NOW()')
      .getMany();
  }

  // ──────────────────────────────────────────────
  //  Subscription Download methods
  // ──────────────────────────────────────────────

  async hasUserDownloadedProduct(userId: string, productId: string): Promise<boolean> {
    const count = await this.subscriptionDownloadRepository.count({
      where: { userId, digitalProductId: productId, isActive: true },
    });
    return count > 0;
  }

  async deactivateDownloadsForSubscription(subscriptionId: string): Promise<void> {
    await this.subscriptionDownloadRepository.update(
      { subscriptionId },
      { isActive: false },
    );
  }

  async reactivateDownloadsForSubscription(subscriptionId: string): Promise<void> {
    await this.subscriptionDownloadRepository.update(
      { subscriptionId },
      { isActive: true },
    );
  }

  async createSubscriptionDownload(data: Partial<SubscriptionDownload>): Promise<SubscriptionDownload> {
    const download = this.subscriptionDownloadRepository.create(data);
    return this.subscriptionDownloadRepository.save(download);
  }

  async findSubscriptionDownloads(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<SubscriptionDownload>> {
    const qb = this.subscriptionDownloadRepository
      .createQueryBuilder('download')
      .leftJoinAndSelect('download.digitalProduct', 'digitalProduct')
      .where('download.userId = :userId', { userId });

    if (cursor) {
      const { date, id } = this.decodeCursor(cursor);
      qb.andWhere(
        '(download.createdAt < :cursorDate OR (download.createdAt = :cursorDate AND download.id < :cursorId))',
        { cursorDate: date, cursorId: id },
      );
    }

    qb.orderBy('download.createdAt', 'DESC').addOrderBy('download.id', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
        : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Credit Transaction methods
  // ──────────────────────────────────────────────

  async createCreditTransaction(data: Partial<CreditTransaction>): Promise<CreditTransaction> {
    const transaction = this.creditTransactionRepository.create(data);
    return this.creditTransactionRepository.save(transaction);
  }

  async findCreditTransactions(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<CreditTransaction>> {
    const qb = this.creditTransactionRepository
      .createQueryBuilder('txn')
      .leftJoinAndSelect('txn.digitalProduct', 'digitalProduct')
      .where('txn.userId = :userId', { userId });

    if (cursor) {
      const { date, id } = this.decodeCursor(cursor);
      qb.andWhere(
        '(txn.createdAt < :cursorDate OR (txn.createdAt = :cursorDate AND txn.id < :cursorId))',
        { cursorDate: date, cursorId: id },
      );
    }

    qb.orderBy('txn.createdAt', 'DESC').addOrderBy('txn.id', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
        : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Helper methods
  // ──────────────────────────────────────────────

  async findDigitalProductById(productId: string): Promise<DigitalProduct | null> {
    return this.digitalProductRepository.findOne({
      where: { id: productId },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  getSubscriptionRepository(): Repository<MarketplaceSubscription> {
    return this.subscriptionRepository;
  }

  getCreditTransactionRepository(): Repository<CreditTransaction> {
    return this.creditTransactionRepository;
  }
}
