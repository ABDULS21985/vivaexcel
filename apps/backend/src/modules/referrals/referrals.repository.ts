import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralCode } from '../../entities/referral-code.entity';
import { Referral, ReferralStatus } from '../../entities/referral.entity';
import { ReferralQueryDto } from './dto/referral-query.dto';

@Injectable()
export class ReferralsRepository {
  private readonly logger = new Logger(ReferralsRepository.name);

  constructor(
    @InjectRepository(ReferralCode)
    private readonly codeRepo: Repository<ReferralCode>,
    @InjectRepository(Referral)
    private readonly referralRepo: Repository<Referral>,
  ) {}

  // ─── Referral Codes ───────────────────────────────────────────────

  async findCodeByUserId(userId: string) {
    return this.codeRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findCodeByCode(code: string) {
    return this.codeRepo.findOne({
      where: { code, isActive: true },
      relations: ['user'],
    });
  }

  async createCode(data: Partial<ReferralCode>) {
    const code = this.codeRepo.create(data);
    return this.codeRepo.save(code);
  }

  async incrementCodeStats(codeId: string, field: 'referralCount' | 'rewardEarned', amount: number) {
    await this.codeRepo.increment({ id: codeId }, field, amount);
  }

  // ─── Referrals ────────────────────────────────────────────────────

  async findReferralByReferredId(referredId: string) {
    return this.referralRepo.findOne({
      where: { referredId },
      relations: ['referralCode', 'referrer'],
    });
  }

  async findReferralsByReferrer(referrerId: string, query: ReferralQueryDto) {
    const { cursor, limit = 20, status } = query;

    const qb = this.referralRepo
      .createQueryBuilder('referral')
      .leftJoinAndSelect('referral.referredUser', 'referredUser')
      .where('referral.referrerId = :referrerId', { referrerId });

    if (status) {
      qb.andWhere('referral.status = :status', { status });
    }

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('referral.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('referral.createdAt', 'DESC');
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

  async createReferral(data: Partial<Referral>) {
    const referral = this.referralRepo.create(data);
    return this.referralRepo.save(referral);
  }

  async updateReferral(id: string, data: Partial<Referral>) {
    await this.referralRepo.update(id, data);
    return this.referralRepo.findOne({ where: { id } });
  }

  async getReferralStats(referrerId: string) {
    const totalReferrals = await this.referralRepo.count({
      where: { referrerId },
    });

    const successfulReferrals = await this.referralRepo.count({
      where: { referrerId, status: ReferralStatus.REWARDED },
    });

    const rewardsResult = await this.referralRepo
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.referrerReward), 0)', 'total')
      .where('r.referrerId = :referrerId', { referrerId })
      .andWhere('r.status = :status', { status: ReferralStatus.REWARDED })
      .getRawOne();

    return {
      totalReferrals,
      successfulReferrals,
      rewardsEarned: parseFloat(rewardsResult?.total || '0'),
    };
  }

  // ─── Cursor Helpers ───────────────────────────────────────────────

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
