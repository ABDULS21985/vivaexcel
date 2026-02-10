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

    // Send email
    try {
      const userName = seller.user.firstName || seller.displayName || 'Seller';
      const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller-dashboard`;

      const htmlContent = `
        <h2 style="color: #1E4DB7; margin-bottom: 16px;">Hello ${userName},</h2>
        <p>Here's your weekly seller performance summary:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background-color: #f0f4ff;">
            <td style="padding: 12px; border: 1px solid #e0e7ff; font-weight: 600;">Revenue (7 days)</td>
            <td style="padding: 12px; border: 1px solid #e0e7ff;">$${weekRevenue.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e0e7ff; font-weight: 600;">Sales Count</td>
            <td style="padding: 12px; border: 1px solid #e0e7ff;">${weekSales}</td>
          </tr>
          <tr style="background-color: #f0f4ff;">
            <td style="padding: 12px; border: 1px solid #e0e7ff; font-weight: 600;">Average Rating</td>
            <td style="padding: 12px; border: 1px solid #e0e7ff;">${Number(seller.averageRating).toFixed(1)} / 5.0</td>
          </tr>
        </table>

        ${topInsight ? `
        <div style="background: linear-gradient(135deg, #1E4DB7 0%, #3B6FD4 100%); color: white; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px; color: white;">Top Insight: ${topInsight.title}</h3>
          <p style="margin: 0; opacity: 0.9;">${topInsight.description}</p>
        </div>
        ` : ''}

        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
          <strong>Tip of the Week:</strong><br/>
          ${actionableTip}
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #1E4DB7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
        </div>
      `;

      await this.emailService.sendNotification(
        seller.user.email,
        'Your Weekly Seller Digest - KTBlog',
        htmlContent,
      );
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
