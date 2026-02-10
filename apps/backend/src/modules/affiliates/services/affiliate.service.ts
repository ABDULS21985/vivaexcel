import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as crypto from 'crypto';

import { AffiliateProfile, AffiliateStatus, AffiliateTier } from '../../../entities/affiliate-profile.entity';
import { AffiliateClick } from '../../../entities/affiliate-click.entity';
import { CommissionStatus } from '../../../entities/affiliate-commission.entity';
import { OrderStatus } from '../../../entities/order.entity';
import { AffiliatesRepository } from '../affiliates.repository';
import { CreateAffiliateApplicationDto } from '../dto/create-affiliate-application.dto';
import { UpdateAffiliateProfileDto } from '../dto/update-affiliate-profile.dto';
import { CreateAffiliateLinkDto } from '../dto/create-affiliate-link.dto';

const TIER_THRESHOLDS: Record<AffiliateTier, { minRevenue: number; commissionRate: number }> = {
  [AffiliateTier.STANDARD]: { minRevenue: 0, commissionRate: 10 },
  [AffiliateTier.SILVER]: { minRevenue: 1000, commissionRate: 15 },
  [AffiliateTier.GOLD]: { minRevenue: 5000, commissionRate: 20 },
  [AffiliateTier.PLATINUM]: { minRevenue: 25000, commissionRate: 25 },
};

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);

  constructor(
    private readonly repository: AffiliatesRepository,
  ) { }

  // ─── Application / Profile ────────────────────────────────────────

  async applyAsAffiliate(userId: string, dto: CreateAffiliateApplicationDto) {
    const existing = await this.repository.findAffiliateByUserId(userId);
    if (existing) {
      throw new ConflictException('You already have an affiliate profile');
    }

    const affiliateCode = `KT-${nanoid(6).toUpperCase()}`;

    const profile = await this.repository.createAffiliateProfile({
      userId,
      affiliateCode,
      customSlug: dto.customSlug || undefined,
      status: AffiliateStatus.PENDING_APPROVAL,
      tier: AffiliateTier.STANDARD,
      commissionRate: TIER_THRESHOLDS[AffiliateTier.STANDARD].commissionRate,
      bio: dto.bio,
      website: dto.website,
      socialLinks: dto.socialLinks,
      promotionMethods: dto.promotionMethods,
      applicationNote: dto.applicationNote,
    });

    this.logger.log(`Affiliate application created: ${profile.id} for user ${userId}`);
    return profile;
  }

  async getMyProfile(userId: string) {
    const profile = await this.repository.findAffiliateByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Affiliate profile not found. Apply first.');
    }
    return profile;
  }

  async updateMyProfile(userId: string, dto: UpdateAffiliateProfileDto) {
    const profile = await this.getMyProfile(userId);

    if (profile.status !== AffiliateStatus.ACTIVE) {
      throw new ForbiddenException('Only active affiliates can update their profile');
    }

    return this.repository.updateAffiliateProfile(profile.id, dto as any);
  }

  async getAffiliateStats(userId: string) {
    const profile = await this.getMyProfile(userId);
    const earnings = await this.repository.getAffiliateEarnings(profile.id);

    return {
      profile,
      earnings,
      lifetimeSales: profile.lifetimeSales,
      lifetimeRevenue: Number(profile.lifetimeRevenue),
      lifetimeCommission: Number(profile.lifetimeCommission),
      pendingBalance: Number(profile.pendingBalance),
      paidBalance: Number(profile.paidBalance),
      currentTier: profile.tier,
      commissionRate: Number(profile.commissionRate),
      nextTier: this.getNextTier(profile.tier),
      nextTierThreshold: this.getNextTierThreshold(profile.tier),
      progressToNextTier: this.getTierProgress(profile),
    };
  }

  // ─── Link Management ──────────────────────────────────────────────

  async createLink(userId: string, dto: CreateAffiliateLinkDto) {
    const profile = await this.getMyProfile(userId);
    if (profile.status !== AffiliateStatus.ACTIVE) {
      throw new ForbiddenException('Only active affiliates can create links');
    }

    const shortCode = nanoid(6);

    const link = await this.repository.createLink({
      affiliateId: profile.id,
      shortCode,
      fullUrl: dto.fullUrl,
      digitalProductId: dto.digitalProductId,
      customCampaign: dto.customCampaign,
    });

    this.logger.log(`Affiliate link created: ${link.id} (${shortCode}) for affiliate ${profile.id}`);
    return link;
  }

  async getMyLinks(userId: string, query: { cursor?: string; limit?: number }) {
    const profile = await this.getMyProfile(userId);
    return this.repository.findLinksByAffiliateId(profile.id, query);
  }

  async deleteLink(userId: string, linkId: string) {
    const profile = await this.getMyProfile(userId);
    const link = await this.repository.findLinkById(linkId);

    if (!link || link.affiliateId !== profile.id) {
      throw new NotFoundException('Link not found');
    }

    await this.repository.updateLink(linkId, { isActive: false });
    this.logger.log(`Affiliate link deactivated: ${linkId}`);
    return { message: 'Link deactivated' };
  }

  // ─── Click Tracking ───────────────────────────────────────────────

  async trackClick(
    shortCode: string,
    ip: string,
    userAgent?: string,
    referrer?: string,
  ): Promise<{ redirectUrl: string; sessionId: string }> {
    const link = await this.repository.findLinkByShortCode(shortCode);
    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.affiliate.status !== AffiliateStatus.ACTIVE) {
      throw new NotFoundException('Link not found');
    }

    const visitorIp = this.hashValue(ip);
    const sessionId = nanoid(16);

    // Check for duplicate click within 24h
    const recentClick = await this.repository.findRecentClickByIp(visitorIp, link.id, 24);
    const isUnique = !recentClick;

    const cookieExpiresAt = new Date();
    cookieExpiresAt.setDate(cookieExpiresAt.getDate() + 30);

    await this.repository.createClick({
      linkId: link.id,
      affiliateId: link.affiliateId,
      visitorIp,
      userAgent,
      referrer,
      isUnique,
      sessionId,
      cookieExpiresAt,
    });

    // Increment click counters
    await this.repository.incrementLinkStats(link.id, 'clicks');
    if (isUnique) {
      await this.repository.incrementLinkStats(link.id, 'uniqueClicks');
    }

    this.logger.log(`Click tracked for link ${shortCode} (unique: ${isUnique})`);

    return {
      redirectUrl: link.fullUrl,
      sessionId,
    };
  }

  // ─── Commission Creation (called from checkout) ───────────────────

  async createCommissionsForOrder(
    order: { id: string; orderNumber: string; userId: string },
    orderItems: Array<{ id: string; digitalProductId?: string; price: number; currency?: string }>,
    sessionId: string,
  ) {
    // Find the click that set this session
    const click = await this.repository.findClickBySessionId(sessionId);
    if (!click) {
      this.logger.log(`No affiliate click found for session ${sessionId}`);
      return;
    }

    // Check cookie hasn't expired
    if (click.cookieExpiresAt && click.cookieExpiresAt < new Date()) {
      this.logger.log(`Affiliate cookie expired for session ${sessionId}`);
      return;
    }

    const affiliate = click.affiliate;
    if (!affiliate || affiliate.status !== AffiliateStatus.ACTIVE) {
      this.logger.log(`Affiliate not active for session ${sessionId}`);
      return;
    }

    // Prevent self-referral
    if (order.userId === affiliate.userId) {
      this.logger.warn(`Self-referral detected: user ${order.userId} is affiliate ${affiliate.id}`);
      return;
    }

    const commissionRate = Number(affiliate.commissionRate);

    for (const item of orderItems) {
      const saleAmount = Number(item.price);
      const commissionAmount = parseFloat(((saleAmount * commissionRate) / 100).toFixed(2));

      await this.repository.createCommission({
        affiliateId: affiliate.id,
        orderId: order.id,
        orderItemId: item.id,
        productId: item.digitalProductId,
        clickId: click.id,
        linkId: click.linkId,
        saleAmount,
        commissionRate,
        commissionAmount,
        currency: item.currency || 'USD',
        status: CommissionStatus.PENDING,
        cookieSetAt: click.createdAt,
      });

      // Update link stats
      if (click.linkId) {
        await this.repository.incrementLinkRevenue(click.linkId, saleAmount, commissionAmount);
      }
    }

    // Mark click as converted
    await this.repository.markClickConverted(click.id, order.id);

    // Update affiliate lifetime stats
    const totalSaleAmount = orderItems.reduce((sum, item) => sum + Number(item.price), 0);
    const totalCommission = orderItems.reduce((sum, item) => {
      return sum + parseFloat(((Number(item.price) * commissionRate) / 100).toFixed(2));
    }, 0);

    await this.repository.updateAffiliateProfile(affiliate.id, {
      lifetimeSales: affiliate.lifetimeSales + orderItems.length,
      lifetimeRevenue: Number(affiliate.lifetimeRevenue) + totalSaleAmount,
      lifetimeCommission: Number(affiliate.lifetimeCommission) + totalCommission,
      pendingBalance: Number(affiliate.pendingBalance) + totalCommission,
    } as any);

    // Check for tier upgrade
    await this.recalculateTier(affiliate.id);

    this.logger.log(
      `Created ${orderItems.length} commissions for order ${order.orderNumber}, affiliate ${affiliate.affiliateCode}`,
    );
  }

  async reverseCommissionsForOrder(orderId: string) {
    const commissions = await this.repository.findCommissionsByOrderId(orderId);

    for (const commission of commissions) {
      if (commission.status === CommissionStatus.PENDING || commission.status === CommissionStatus.APPROVED) {
        await this.repository.updateCommission(commission.id, {
          status: CommissionStatus.REVERSED,
        });

        // Reduce pending balance
        const affiliate = await this.repository.findAffiliateById(commission.affiliateId);
        if (affiliate) {
          const newPending = Math.max(0, Number(affiliate.pendingBalance) - Number(commission.commissionAmount));
          await this.repository.updateAffiliateProfile(affiliate.id, {
            pendingBalance: newPending,
          } as any);
        }
      }
    }

    this.logger.log(`Reversed ${commissions.length} commissions for order ${orderId}`);
  }

  // ─── Tier Progression ─────────────────────────────────────────────

  async recalculateTier(affiliateId: string) {
    const affiliate = await this.repository.findAffiliateById(affiliateId);
    if (!affiliate) return;

    const revenue = Number(affiliate.lifetimeRevenue);
    let newTier = AffiliateTier.STANDARD;

    if (revenue >= TIER_THRESHOLDS[AffiliateTier.PLATINUM].minRevenue) {
      newTier = AffiliateTier.PLATINUM;
    } else if (revenue >= TIER_THRESHOLDS[AffiliateTier.GOLD].minRevenue) {
      newTier = AffiliateTier.GOLD;
    } else if (revenue >= TIER_THRESHOLDS[AffiliateTier.SILVER].minRevenue) {
      newTier = AffiliateTier.SILVER;
    }

    if (newTier !== affiliate.tier) {
      const newRate = TIER_THRESHOLDS[newTier].commissionRate;
      await this.repository.updateAffiliateProfile(affiliateId, {
        tier: newTier,
        commissionRate: newRate,
      } as any);
      this.logger.log(`Affiliate ${affiliateId} upgraded to ${newTier} (${newRate}% commission)`);
    }
  }

  // ─── Admin Methods ────────────────────────────────────────────────

  async reviewApplication(affiliateId: string, decision: AffiliateStatus.ACTIVE | AffiliateStatus.REJECTED, reviewNotes?: string) {
    const affiliate = await this.repository.findAffiliateById(affiliateId);
    if (!affiliate) throw new NotFoundException('Affiliate not found');
    if (affiliate.status !== AffiliateStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending applications can be reviewed');
    }

    const data: Partial<AffiliateProfile> = {
      status: decision,
      approvedAt: decision === AffiliateStatus.ACTIVE ? new Date() : undefined,
    };

    const updated = await this.repository.updateAffiliateProfile(affiliateId, data);
    this.logger.log(`Affiliate ${affiliateId} ${decision}`);
    return updated;
  }

  async suspendAffiliate(affiliateId: string) {
    const affiliate = await this.repository.findAffiliateById(affiliateId);
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    await this.repository.updateAffiliateProfile(affiliateId, {
      status: AffiliateStatus.SUSPENDED,
    });
    this.logger.log(`Affiliate ${affiliateId} suspended`);
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private getNextTier(currentTier: AffiliateTier): AffiliateTier | null {
    const tiers = [AffiliateTier.STANDARD, AffiliateTier.SILVER, AffiliateTier.GOLD, AffiliateTier.PLATINUM];
    const idx = tiers.indexOf(currentTier);
    return idx < tiers.length - 1 ? tiers[idx + 1] : null;
  }

  private getNextTierThreshold(currentTier: AffiliateTier): number | null {
    const nextTier = this.getNextTier(currentTier);
    return nextTier ? TIER_THRESHOLDS[nextTier].minRevenue : null;
  }

  private getTierProgress(profile: AffiliateProfile): number {
    const nextTier = this.getNextTier(profile.tier);
    if (!nextTier) return 100;

    const currentThreshold = TIER_THRESHOLDS[profile.tier].minRevenue;
    const nextThreshold = TIER_THRESHOLDS[nextTier].minRevenue;
    const revenue = Number(profile.lifetimeRevenue);

    return Math.min(100, Math.round(((revenue - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
  }
}
