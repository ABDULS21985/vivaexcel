import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { ReferralStatus } from '../../entities/referral.entity';
import { ReferralsRepository } from './referrals.repository';
import { ReferralQueryDto } from './dto/referral-query.dto';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);
  private readonly frontendUrl: string;
  private readonly referrerRewardAmount: number;
  private readonly referredRewardAmount: number;

  constructor(
    private readonly repository: ReferralsRepository,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.referrerRewardAmount = parseFloat(this.configService.get<string>('REFERRAL_REFERRER_REWARD') || '5');
    this.referredRewardAmount = parseFloat(this.configService.get<string>('REFERRAL_REFERRED_REWARD') || '10');
  }

  async getOrCreateReferralCode(userId: string) {
    let codeEntry = await this.repository.findCodeByUserId(userId);

    if (!codeEntry) {
      const code = `REF-${nanoid(6).toUpperCase()}`;
      codeEntry = await this.repository.createCode({
        userId,
        code,
      });
      this.logger.log(`Referral code created: ${code} for user ${userId}`);
    }

    return {
      ...codeEntry,
      shareUrl: `${this.frontendUrl}/register?ref=${codeEntry.code}`,
    };
  }

  async getMyReferrals(userId: string, query: ReferralQueryDto) {
    return this.repository.findReferralsByReferrer(userId, query);
  }

  async getMyReferralStats(userId: string) {
    return this.repository.getReferralStats(userId);
  }

  async validateCode(code: string) {
    const codeEntry = await this.repository.findCodeByCode(code);
    return { valid: !!codeEntry };
  }

  async recordReferralSignup(referralCode: string, newUserId: string) {
    // Validate the referral code
    const codeEntry = await this.repository.findCodeByCode(referralCode);
    if (!codeEntry) {
      this.logger.warn(`Invalid referral code used: ${referralCode}`);
      return;
    }

    // Prevent self-referral
    if (codeEntry.userId === newUserId) {
      this.logger.warn(`Self-referral attempt: user ${newUserId} with code ${referralCode}`);
      return;
    }

    // Check if this user was already referred
    const existing = await this.repository.findReferralByReferredId(newUserId);
    if (existing) {
      this.logger.warn(`User ${newUserId} was already referred`);
      return;
    }

    await this.repository.createReferral({
      referrerId: codeEntry.userId,
      referredId: newUserId,
      referralCodeId: codeEntry.id,
      status: ReferralStatus.SIGNUP_COMPLETE,
      referrerReward: this.referrerRewardAmount,
      referredReward: this.referredRewardAmount,
    });

    await this.repository.incrementCodeStats(codeEntry.id, 'referralCount', 1);

    this.logger.log(
      `Referral recorded: ${codeEntry.userId} referred ${newUserId} via code ${referralCode}`,
    );
  }

  async qualifyReferral(referredUserId: string, orderId: string) {
    const referral = await this.repository.findReferralByReferredId(referredUserId);
    if (!referral) return; // User wasn't referred

    // Only qualify on first purchase (status must be SIGNUP_COMPLETE)
    if (referral.status !== ReferralStatus.SIGNUP_COMPLETE) return;

    await this.repository.updateReferral(referral.id, {
      status: ReferralStatus.FIRST_PURCHASE,
      orderId,
    });

    // Auto-reward
    await this.applyReferralRewards(referral.id);

    this.logger.log(
      `Referral qualified: ${referral.referrerId} earned reward from ${referredUserId}'s first purchase`,
    );
  }

  private async applyReferralRewards(referralId: string) {
    const referral = await this.repository.findReferralByReferredId('');
    // Re-fetch to get latest
    const ref = await this.repository.updateReferral(referralId, {
      status: ReferralStatus.REWARDED,
      rewardedAt: new Date(),
    });

    if (ref) {
      // Increment referrer's reward earned on the referral code
      await this.repository.incrementCodeStats(ref.referralCodeId, 'rewardEarned', Number(ref.referrerReward));
    }

    this.logger.log(`Referral rewards applied for referral ${referralId}`);
  }
}
