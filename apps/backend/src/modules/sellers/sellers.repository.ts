import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProfile, SellerStatus } from '../../entities/seller-profile.entity';
import { SellerPayout, PayoutStatus } from '../../entities/seller-payout.entity';
import { SellerApplication, SellerApplicationStatus } from '../../entities/seller-application.entity';
import { SellerQueryDto } from './dto/seller-query.dto';
import { PayoutQueryDto } from './dto/payout-query.dto';
import { ApplicationQueryDto } from './dto/application-query.dto';

@Injectable()
export class SellersRepository {
  private readonly logger = new Logger(SellersRepository.name);

  constructor(
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    @InjectRepository(SellerPayout)
    private readonly sellerPayoutRepo: Repository<SellerPayout>,
    @InjectRepository(SellerApplication)
    private readonly sellerApplicationRepo: Repository<SellerApplication>,
  ) { }

  // ─── Seller Profiles ─────────────────────────────────────────────

  async findAllSellers(query: SellerQueryDto) {
    const { cursor, limit = 20, search, status, verificationStatus, specialty } = query;

    const qb = this.sellerProfileRepo
      .createQueryBuilder('seller')
      .leftJoinAndSelect('seller.user', 'user');

    // Only show approved sellers for public queries (filtered by caller)
    if (status) {
      qb.andWhere('seller.status = :status', { status });
    }

    if (verificationStatus) {
      qb.andWhere('seller.verificationStatus = :verificationStatus', { verificationStatus });
    }

    if (search) {
      qb.andWhere(
        '(seller.displayName ILIKE :search OR seller.bio ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (specialty) {
      qb.andWhere('seller.specialties @> :specialty', {
        specialty: JSON.stringify([specialty]),
      });
    }

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('seller.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('seller.totalSales', 'DESC')
      .addOrderBy('seller.createdAt', 'DESC');
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

  async findSellerBySlug(slug: string) {
    return this.sellerProfileRepo.findOne({
      where: { slug },
      relations: ['user'],
    });
  }

  async findSellerById(id: string) {
    return this.sellerProfileRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findSellerByUserId(userId: string) {
    return this.sellerProfileRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async createSellerProfile(data: Partial<SellerProfile>) {
    const seller = this.sellerProfileRepo.create(data);
    return this.sellerProfileRepo.save(seller);
  }

  async updateSellerProfile(id: string, data: Partial<SellerProfile>) {
    await this.sellerProfileRepo.update(id, data);
    return this.findSellerById(id);
  }

  async incrementSellerStats(sellerId: string, amount: number) {
    await this.sellerProfileRepo.increment({ id: sellerId }, 'totalSales', 1);
    await this.sellerProfileRepo.increment({ id: sellerId }, 'totalRevenue', amount);
  }

  // ─── Applications ────────────────────────────────────────────────

  async findAllApplications(query: ApplicationQueryDto) {
    const { cursor, limit = 20, search, status } = query;

    const qb = this.sellerApplicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user');

    if (status) {
      qb.andWhere('app.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(app.displayName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('app.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('app.createdAt', 'DESC');
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

  async findApplicationByUserId(userId: string) {
    return this.sellerApplicationRepo.findOne({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findApplicationById(id: string) {
    return this.sellerApplicationRepo.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });
  }

  async createApplication(data: Partial<SellerApplication>) {
    const app = this.sellerApplicationRepo.create(data);
    return this.sellerApplicationRepo.save(app);
  }

  async updateApplication(id: string, data: Partial<SellerApplication>) {
    await this.sellerApplicationRepo.update(id, data);
    return this.findApplicationById(id);
  }

  // ─── Payouts ─────────────────────────────────────────────────────

  async findPayouts(query: PayoutQueryDto) {
    const { cursor, limit = 20, status, sellerId, dateFrom, dateTo } = query;

    const qb = this.sellerPayoutRepo
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.seller', 'seller');

    if (sellerId) {
      qb.andWhere('payout.sellerId = :sellerId', { sellerId });
    }

    if (status) {
      qb.andWhere('payout.status = :status', { status });
    }

    if (dateFrom) {
      qb.andWhere('payout.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    }

    if (dateTo) {
      qb.andWhere('payout.createdAt <= :dateTo', { dateTo: new Date(dateTo) });
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

  async createPayout(data: Partial<SellerPayout>) {
    const payout = this.sellerPayoutRepo.create(data);
    return this.sellerPayoutRepo.save(payout);
  }

  async updatePayout(id: string, data: Partial<SellerPayout>) {
    await this.sellerPayoutRepo.update(id, data);
    return this.sellerPayoutRepo.findOne({ where: { id }, relations: ['seller'] });
  }

  async getPendingPayoutAmount(sellerId: string): Promise<number> {
    const result = await this.sellerPayoutRepo
      .createQueryBuilder('payout')
      .select('COALESCE(SUM(payout.netAmount), 0)', 'total')
      .where('payout.sellerId = :sellerId', { sellerId })
      .andWhere('payout.status = :status', { status: PayoutStatus.PENDING })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  // ─── Cursor Helpers ──────────────────────────────────────────────

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
