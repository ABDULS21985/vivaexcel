import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In } from 'typeorm';
import { AffiliateProfile, AffiliateStatus } from '../../entities/affiliate-profile.entity';
import { AffiliateLink } from '../../entities/affiliate-link.entity';
import { AffiliateClick } from '../../entities/affiliate-click.entity';
import { AffiliateCommission, CommissionStatus } from '../../entities/affiliate-commission.entity';
import { AffiliatePayout, AffiliatePayoutStatus } from '../../entities/affiliate-payout.entity';
import { AffiliateQueryDto } from './dto/affiliate-query.dto';
import { CommissionQueryDto } from './dto/commission-query.dto';
import { PayoutQueryDto } from './dto/payout-query.dto';

@Injectable()
export class AffiliatesRepository {
  private readonly logger = new Logger(AffiliatesRepository.name);

  constructor(
    @InjectRepository(AffiliateProfile)
    private readonly profileRepo: Repository<AffiliateProfile>,
    @InjectRepository(AffiliateLink)
    private readonly linkRepo: Repository<AffiliateLink>,
    @InjectRepository(AffiliateClick)
    private readonly clickRepo: Repository<AffiliateClick>,
    @InjectRepository(AffiliateCommission)
    private readonly commissionRepo: Repository<AffiliateCommission>,
    @InjectRepository(AffiliatePayout)
    private readonly payoutRepo: Repository<AffiliatePayout>,
  ) {}

  // ─── Profiles ───────────────────────────────────────────────────────

  async findAllAffiliates(query: AffiliateQueryDto) {
    const { cursor, limit = 20, search, status, tier } = query;

    const qb = this.profileRepo
      .createQueryBuilder('affiliate')
      .leftJoinAndSelect('affiliate.user', 'user');

    if (status) {
      qb.andWhere('affiliate.status = :status', { status });
    }

    if (tier) {
      qb.andWhere('affiliate.tier = :tier', { tier });
    }

    if (search) {
      qb.andWhere(
        '(affiliate.affiliateCode ILIKE :search OR affiliate.customSlug ILIKE :search OR user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('affiliate.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('affiliate.createdAt', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: items[items.length - 1].createdAt.toISOString() })
      : undefined;

    return {
      items,
      meta: { hasNextPage, hasPreviousPage: !!cursor, nextCursor, previousCursor: cursor },
    };
  }

  async findAffiliateById(id: string) {
    return this.profileRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findAffiliateByUserId(userId: string) {
    return this.profileRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findAffiliateByCode(code: string) {
    return this.profileRepo.findOne({
      where: { affiliateCode: code },
    });
  }

  async findAffiliateBySlug(slug: string) {
    return this.profileRepo.findOne({
      where: { customSlug: slug },
      relations: ['user'],
    });
  }

  async createAffiliateProfile(data: Partial<AffiliateProfile>) {
    const profile = this.profileRepo.create(data);
    return this.profileRepo.save(profile);
  }

  async updateAffiliateProfile(id: string, data: Partial<AffiliateProfile>) {
    await this.profileRepo.update(id, data);
    return this.findAffiliateById(id);
  }

  async countAffiliatesByStatus() {
    const result = await this.profileRepo
      .createQueryBuilder('affiliate')
      .select('affiliate.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('affiliate.status')
      .getRawMany();

    return result.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);
  }

  // ─── Links ──────────────────────────────────────────────────────────

  async findLinksByAffiliateId(affiliateId: string, query: { cursor?: string; limit?: number }) {
    const { cursor, limit = 20 } = query;

    const qb = this.linkRepo
      .createQueryBuilder('link')
      .where('link.affiliateId = :affiliateId', { affiliateId })
      .andWhere('link.deletedAt IS NULL');

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('link.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('link.createdAt', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: items[items.length - 1].createdAt.toISOString() })
      : undefined;

    return {
      items,
      meta: { hasNextPage, hasPreviousPage: !!cursor, nextCursor, previousCursor: cursor },
    };
  }

  async findLinkByShortCode(shortCode: string) {
    return this.linkRepo.findOne({
      where: { shortCode, isActive: true },
      relations: ['affiliate'],
    });
  }

  async findLinkById(id: string) {
    return this.linkRepo.findOne({ where: { id } });
  }

  async createLink(data: Partial<AffiliateLink>) {
    const link = this.linkRepo.create(data);
    return this.linkRepo.save(link);
  }

  async updateLink(id: string, data: Partial<AffiliateLink>) {
    await this.linkRepo.update(id, data);
    return this.findLinkById(id);
  }

  async incrementLinkStats(linkId: string, field: 'clicks' | 'uniqueClicks' | 'conversions', amount = 1) {
    await this.linkRepo.increment({ id: linkId }, field, amount);
  }

  async incrementLinkRevenue(linkId: string, revenue: number, commission: number) {
    await this.linkRepo
      .createQueryBuilder()
      .update(AffiliateLink)
      .set({
        revenue: () => `revenue + ${revenue}`,
        commission: () => `commission + ${commission}`,
        conversions: () => 'conversions + 1',
      })
      .where('id = :linkId', { linkId })
      .execute();
  }

  // ─── Clicks ─────────────────────────────────────────────────────────

  async createClick(data: Partial<AffiliateClick>) {
    const click = this.clickRepo.create(data);
    return this.clickRepo.save(click);
  }

  async findRecentClickByIp(visitorIp: string, linkId: string, windowHours = 24) {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - windowHours);

    return this.clickRepo.findOne({
      where: {
        visitorIp,
        linkId,
        createdAt: MoreThan(windowStart),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findClickBySessionId(sessionId: string) {
    return this.clickRepo.findOne({
      where: { sessionId },
      relations: ['affiliate', 'link'],
      order: { createdAt: 'DESC' },
    });
  }

  async markClickConverted(clickId: string, orderId: string) {
    await this.clickRepo.update(clickId, {
      convertedToSale: true,
      orderId,
    });
  }

  // ─── Commissions ───────────────────────────────────────────────────

  async findCommissions(query: CommissionQueryDto & { affiliateId?: string }) {
    const { cursor, limit = 20, status, dateFrom, dateTo, flagged, affiliateId } = query;

    const qb = this.commissionRepo
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.affiliate', 'affiliate')
      .leftJoinAndSelect('affiliate.user', 'user')
      .leftJoinAndSelect('commission.order', 'order');

    if (affiliateId) {
      qb.andWhere('commission.affiliateId = :affiliateId', { affiliateId });
    }

    if (status) {
      qb.andWhere('commission.status = :status', { status });
    }

    if (flagged !== undefined) {
      qb.andWhere('commission.flagged = :flagged', { flagged });
    }

    if (dateFrom) {
      qb.andWhere('commission.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    }

    if (dateTo) {
      qb.andWhere('commission.createdAt <= :dateTo', { dateTo: new Date(dateTo) });
    }

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('commission.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('commission.createdAt', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: items[items.length - 1].createdAt.toISOString() })
      : undefined;

    return {
      items,
      meta: { hasNextPage, hasPreviousPage: !!cursor, nextCursor, previousCursor: cursor },
    };
  }

  async createCommission(data: Partial<AffiliateCommission>) {
    const commission = this.commissionRepo.create(data);
    return this.commissionRepo.save(commission);
  }

  async updateCommission(id: string, data: Partial<AffiliateCommission>) {
    await this.commissionRepo.update(id, data);
    return this.commissionRepo.findOne({ where: { id } });
  }

  async findPendingCommissionsOlderThan(date: Date) {
    return this.commissionRepo.find({
      where: {
        status: CommissionStatus.PENDING,
        flagged: false,
        createdAt: LessThan(date),
      },
      relations: ['order'],
    });
  }

  async findApprovedUnpaidCommissions(affiliateId: string) {
    return this.commissionRepo.find({
      where: {
        affiliateId,
        status: CommissionStatus.APPROVED,
        payoutId: undefined as any,
      },
    });
  }

  async sumApprovedUnpaidCommissions(affiliateId: string): Promise<number> {
    const result = await this.commissionRepo
      .createQueryBuilder('commission')
      .select('COALESCE(SUM(commission.commissionAmount), 0)', 'total')
      .where('commission.affiliateId = :affiliateId', { affiliateId })
      .andWhere('commission.status = :status', { status: CommissionStatus.APPROVED })
      .andWhere('commission.payoutId IS NULL')
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async findCommissionsByOrderId(orderId: string) {
    return this.commissionRepo.find({
      where: { orderId },
    });
  }

  async bulkUpdateCommissionStatus(ids: string[], status: CommissionStatus, extraData?: Partial<AffiliateCommission>) {
    await this.commissionRepo
      .createQueryBuilder()
      .update(AffiliateCommission)
      .set({ status, ...extraData })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  // ─── Payouts ────────────────────────────────────────────────────────

  async findPayouts(query: PayoutQueryDto & { affiliateId?: string }) {
    const { cursor, limit = 20, status, affiliateId } = query;

    const qb = this.payoutRepo
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.affiliate', 'affiliate')
      .leftJoinAndSelect('affiliate.user', 'user');

    if (affiliateId) {
      qb.andWhere('payout.affiliateId = :affiliateId', { affiliateId });
    }

    if (status) {
      qb.andWhere('payout.status = :status', { status });
    }

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('payout.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('payout.createdAt', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: items[items.length - 1].createdAt.toISOString() })
      : undefined;

    return {
      items,
      meta: { hasNextPage, hasPreviousPage: !!cursor, nextCursor, previousCursor: cursor },
    };
  }

  async createPayout(data: Partial<AffiliatePayout>) {
    const payout = this.payoutRepo.create(data);
    return this.payoutRepo.save(payout);
  }

  async updatePayout(id: string, data: Partial<AffiliatePayout>) {
    await this.payoutRepo.update(id, data);
    return this.payoutRepo.findOne({ where: { id } });
  }

  async findPayoutById(id: string) {
    return this.payoutRepo.findOne({
      where: { id },
      relations: ['affiliate', 'commissions'],
    });
  }

  // ─── Stats ──────────────────────────────────────────────────────────

  async getAffiliateEarnings(affiliateId: string) {
    const pending = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.commissionAmount), 0)', 'total')
      .where('c.affiliateId = :affiliateId', { affiliateId })
      .andWhere('c.status = :status', { status: CommissionStatus.PENDING })
      .getRawOne();

    const approved = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.commissionAmount), 0)', 'total')
      .where('c.affiliateId = :affiliateId', { affiliateId })
      .andWhere('c.status = :status', { status: CommissionStatus.APPROVED })
      .andWhere('c.payoutId IS NULL')
      .getRawOne();

    const paid = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.commissionAmount), 0)', 'total')
      .where('c.affiliateId = :affiliateId', { affiliateId })
      .andWhere('c.status = :status', { status: CommissionStatus.PAID })
      .getRawOne();

    return {
      pending: parseFloat(pending?.total || '0'),
      approved: parseFloat(approved?.total || '0'),
      paid: parseFloat(paid?.total || '0'),
    };
  }

  async getAdminStats() {
    const totalAffiliates = await this.profileRepo.count();
    const activeAffiliates = await this.profileRepo.count({ where: { status: AffiliateStatus.ACTIVE } });
    const pendingApplications = await this.profileRepo.count({ where: { status: AffiliateStatus.PENDING_APPROVAL } });

    const totalCommissions = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.commissionAmount), 0)', 'total')
      .getRawOne();

    const pendingCommissions = await this.commissionRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.commissionAmount), 0)', 'total')
      .where('c.status = :status', { status: CommissionStatus.PENDING })
      .getRawOne();

    const pendingPayouts = await this.payoutRepo.count({
      where: { status: AffiliatePayoutStatus.PENDING },
    });

    return {
      totalAffiliates,
      activeAffiliates,
      pendingApplications,
      totalCommissions: parseFloat(totalCommissions?.total || '0'),
      pendingCommissions: parseFloat(pendingCommissions?.total || '0'),
      pendingPayouts,
    };
  }

  // ─── Cursor Helpers ─────────────────────────────────────────────────

  private encodeCursor(data: { value: any }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: any } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: null };
    }
  }
}
