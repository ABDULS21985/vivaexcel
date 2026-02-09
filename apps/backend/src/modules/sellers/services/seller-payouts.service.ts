import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SellersRepository } from '../sellers.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { PayoutStatus } from '../../../entities/seller-payout.entity';
import { PayoutQueryDto } from '../dto/payout-query.dto';
import { StripeConnectService } from '../services/stripe-connect.service';

@Injectable()
export class SellerPayoutsService {
  private readonly logger = new Logger(SellerPayoutsService.name);

  constructor(
    private readonly repository: SellersRepository,
    private readonly cacheService: CacheService,
    private readonly stripeConnectService: StripeConnectService,
  ) {}

  async findAll(query: PayoutQueryDto) {
    return this.repository.findPayouts(query);
  }

  async findBySeller(sellerId: string, query: PayoutQueryDto) {
    return this.repository.findPayouts({ ...query, sellerId });
  }

  async getPendingAmount(sellerId: string) {
    return this.repository.getPendingPayoutAmount(sellerId);
  }

  async createPayout(
    sellerId: string,
    amount: number,
    platformFee: number,
    periodStart: Date,
    periodEnd: Date,
    itemCount: number,
  ) {
    const seller = await this.repository.findSellerById(sellerId);
    if (!seller) throw new NotFoundException('Seller not found');

    if (!seller.stripeConnectAccountId || !seller.stripeOnboardingComplete) {
      throw new BadRequestException('Seller has not completed Stripe Connect onboarding');
    }

    const netAmount = amount - platformFee;

    if (netAmount < Number(seller.minimumPayout)) {
      throw new BadRequestException(
        `Net payout amount ($${netAmount.toFixed(2)}) is below minimum payout threshold ($${Number(seller.minimumPayout).toFixed(2)})`,
      );
    }

    const payout = await this.repository.createPayout({
      sellerId,
      amount,
      platformFee,
      netAmount,
      status: PayoutStatus.PENDING,
      periodStart,
      periodEnd,
      itemCount,
    });

    this.logger.log(`Payout ${payout.id} created for seller ${sellerId}: $${netAmount}`);
    return payout;
  }

  async processPayout(payoutId: string) {
    const payout = await this.repository.findPayouts({ limit: 1 } as PayoutQueryDto);
    // Find specific payout
    const payoutRecord = payout.items.find(p => p.id === payoutId);
    if (!payoutRecord) throw new NotFoundException('Payout not found');

    if (payoutRecord.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Payout is not in pending status');
    }

    const seller = await this.repository.findSellerById(payoutRecord.sellerId);
    if (!seller?.stripeConnectAccountId) {
      throw new BadRequestException('Seller Stripe Connect account not found');
    }

    // Update to processing
    await this.repository.updatePayout(payoutId, { status: PayoutStatus.PROCESSING });

    try {
      const transfer = await this.stripeConnectService.createTransfer(
        seller.stripeConnectAccountId,
        Math.round(payoutRecord.netAmount * 100), // Convert to cents
        payoutRecord.currency || 'usd',
        { payoutId, sellerId: seller.id },
      );

      await this.repository.updatePayout(payoutId, {
        status: PayoutStatus.COMPLETED,
        stripeTransferId: transfer.id,
      });

      this.logger.log(`Payout ${payoutId} completed: transfer ${transfer.id}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await this.repository.updatePayout(payoutId, {
        status: PayoutStatus.FAILED,
        failureReason: reason,
      });
      this.logger.error(`Payout ${payoutId} failed: ${reason}`);
      throw error;
    }
  }

  async getSellerEarnings(sellerId: string) {
    const seller = await this.repository.findSellerById(sellerId);
    if (!seller) throw new NotFoundException('Seller not found');

    const pendingAmount = await this.repository.getPendingPayoutAmount(sellerId);

    return {
      totalRevenue: Number(seller.totalRevenue),
      totalSales: seller.totalSales,
      pendingPayout: pendingAmount,
      commissionRate: Number(seller.commissionRate),
      averageRating: Number(seller.averageRating),
    };
  }
}
