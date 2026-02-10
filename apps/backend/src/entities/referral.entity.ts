import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ReferralCode } from './referral-code.entity';
import { User } from './user.entity';

export enum ReferralStatus {
  PENDING = 'pending',
  SIGNUP_COMPLETE = 'signup_complete',
  FIRST_PURCHASE = 'first_purchase',
  REWARDED = 'rewarded',
}

@Entity('referrals')
export class Referral extends BaseEntity {
  @Column({ name: 'referrer_id' })
  @Index()
  referrerId: string;

  @Column({ name: 'referred_id' })
  @Index({ unique: true })
  referredId: string;

  @Column({ name: 'referral_code_id' })
  @Index()
  referralCodeId: string;

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  @Index()
  status: ReferralStatus;

  @Column({
    name: 'referrer_reward',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 5.0,
  })
  referrerReward: number;

  @Column({
    name: 'referred_reward',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 10.0,
  })
  referredReward: number;

  @Column({ name: 'rewarded_at', type: 'timestamp', nullable: true })
  rewardedAt?: Date;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ManyToOne(() => ReferralCode)
  @JoinColumn({ name: 'referral_code_id' })
  referralCode: ReferralCode;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referrer_id' })
  referrer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referred_id' })
  referredUser: User;
}
