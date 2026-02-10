import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { SellerProfile, SellerStatus } from '../../../entities/seller-profile.entity';
import { SellerInsight, InsightStatus, InsightPriority } from '../../../entities/seller-insight.entity';
import { RevenueRecord } from '../../../entities/revenue-record.entity';
import { DigitalProduct, DigitalProductStatus } from '../../../entities/digital-product.entity';
import { PricingOptimizerService } from './pricing-optimizer.service';
import { ListingScorerService } from './listing-scorer.service';
import { MarketOpportunityService } from './market-opportunity.service';
import { EmailService } from '../../email/email.service';
import { NotificationCenterService } from '../../notification-center/notification-center.service';
import { NotificationType, NotificationChannel } from '../../notification-center/enums/notification.enums';
import { MarketOpportunity } from '../dto/seller-growth.dto';

@Injectable()
export class SellerCoachingService {
  private readonly logger = new Logger(SellerCoachingService.name);

  constructor(
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    @InjectRepository(SellerInsight)
    private readonly insightRepo: Repository<SellerInsight>,
    @InjectRepository(RevenueRecord)
    private readonly revenueRecordRepo: Repository<RevenueRecord>,
    @InjectRepository(DigitalProduct)
    private readonly productRepo: Repository<DigitalProduct>,
    private readonly pricingOptimizerService: PricingOptimizerService,
    private readonly listingScorerService: ListingScorerService,
    private readonly marketOpportunityService: MarketOpportunityService,
    private readonly emailService: EmailService,
    private readonly notificationCenterService: NotificationCenterService,
  ) {}

  async generateWeeklyDigest(sellerId: string): Promise<void> {
    const seller = await this.sellerProfileRepo.findOne({
      where: { id: sellerId },
      relations: ['user'],
    });

    if (!seller || !seller.user) {
      this.logger.warn(`Seller ${sellerId} not found or has no user relation`);
      return;
    }

    // Get top insight
    const topInsight = await this.insightRepo.findOne({
      where: { sellerId, status: InsightStatus.PENDING },
      order: {
        priority: 'ASC', // HIGH = 'high' sorts before LOW
        generatedAt: 'DESC',
      },
    });

    // 7-day performance summary
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const perfSummary = await this.revenueRecordRepo
      .createQueryBuilder('r')
      .select('SUM(r.net_revenue)', 'revenue')
      .addSelect('COUNT(*)', 'salesCount')
      .where('r.seller_id = :userId', { userId: seller.userId })
      .andWhere('r.recorded_at >= :since', { since: sevenDaysAgo })
      .getRawOne<{ revenue: string; salesCount: string }>();

    const weekRevenue = parseFloat(perfSummary?.revenue || '0');
    const weekSales = parseInt(perfSummary?.salesCount || '0', 10);

    // Find lowest-scoring product for actionable tip
    let actionableTip = 'Keep your product listings updated with fresh descriptions and images.';
    try {
      const products = await this.productRepo.find({
        where: { createdBy: seller.userId, status: DigitalProductStatus.PUBLISHED },
        take: 5,
      });

      if (products.length > 0) {
        const scores = await Promise.all(
          products.map((p) => this.listingScorerService.scoreProduct(p.id).catch(() => null)),
        );

        const validScores = scores.filter(Boolean);
        if (validScores.length > 0) {
          const lowest = validScores.reduce((min, s) => (s!.overallScore < min!.overallScore ? s : min));
          if (lowest && lowest.suggestions.length > 0) {
            actionableTip = `For "${products.find((p) => p.id === lowest.productId)?.title}": ${lowest.suggestions[0].suggestion}`;
          }
        }
      }
    } catch {
      this.logger.warn('Failed to generate actionable tip for weekly digest');
    }

    // Send email using Handlebars template
    try {
      const userName = seller.user.firstName || seller.displayName || 'Seller';
      const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller-dashboard`;

      await this.emailService.sendSellerWeeklyDigest(seller.user.email, {
        sellerName: userName,
        weekRevenue: weekRevenue.toFixed(2),
        weekSales,
        averageRating: Number(seller.averageRating).toFixed(1),
        insightTitle: topInsight?.title,
        insightDescription: topInsight?.description,
        actionableTip,
        dashboardUrl,
      });
      this.logger.log(`Weekly digest sent to seller ${sellerId}`);
    } catch (error) {
      this.logger.error(`Failed to send weekly digest to seller ${sellerId}: ${(error as Error).message}`);
    }
  }

  async notifyOpportunity(sellerId: string, opportunity: MarketOpportunity): Promise<void> {
    const seller = await this.sellerProfileRepo.findOne({ where: { id: sellerId } });
    if (!seller) return;

    await this.notificationCenterService.sendNotification(seller.userId, {
      type: NotificationType.PRODUCT_UPDATE,
      channel: NotificationChannel.IN_APP,
      title: 'New Market Opportunity',
      body: `"${opportunity.term}" has ${opportunity.searchVolume} searches with ${opportunity.existingProducts} existing products. Potential: ${opportunity.potential}.`,
      actionUrl: '/seller-dashboard/market',
      actionLabel: 'View Opportunity',
    });
  }

  @Cron('0 9 * * 1')
  async sendWeeklyDigests(): Promise<void> {
    this.logger.log('Starting weekly digest cron job...');

    const activeSellers = await this.sellerProfileRepo.find({
      where: { status: SellerStatus.APPROVED },
    });

    for (const seller of activeSellers) {
      try {
        await this.generateWeeklyDigest(seller.id);
        // 500ms delay between calls
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.error(`Weekly digest failed for seller ${seller.id}: ${(error as Error).message}`);
      }
    }

    this.logger.log(`Weekly digest cron job complete. Processed ${activeSellers.length} sellers.`);
  }
}
