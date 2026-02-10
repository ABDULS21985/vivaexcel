import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { PayoutSchedule } from './seller-profile.entity';

export enum AffiliateStatus {
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum AffiliateTier {
  STANDARD = 'standard',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('affiliate_profiles')
export class AffiliateProfile extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index({ unique: true })
  userId: string;

  @Column({ name: 'affiliate_code', unique: true })
  @Index()
  affiliateCode: string;

  @Column({ name: 'custom_slug', nullable: true, unique: true })
  customSlug?: string;

  @Column({
    type: 'enum',
    enum: AffiliateStatus,
    default: AffiliateStatus.PENDING_APPROVAL,
  })
  @Index()
  status: AffiliateStatus;

  @Column({
    type: 'enum',
    enum: AffiliateTier,
    default: AffiliateTier.STANDARD,
  })
  tier: AffiliateTier;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 10.0,
  })
  commissionRate: number;

  @Column({ name: 'lifetime_sales', type: 'int', default: 0 })
  lifetimeSales: number;

  @Column({
    name: 'lifetime_revenue',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  lifetimeRevenue: number;

  @Column({
    name: 'lifetime_commission',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  lifetimeCommission: number;

  @Column({
    name: 'pending_balance',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  pendingBalance: number;

  @Column({
    name: 'paid_balance',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  paidBalance: number;

  @Column({ name: 'stripe_connect_account_id', nullable: true })
  stripeConnectAccountId?: string;

  @Column({ name: 'stripe_onboarding_complete', default: false })
  stripeOnboardingComplete: boolean;

  @Column({
    name: 'payout_threshold',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 50.0,
  })
  payoutThreshold: number;

  @Column({
    name: 'payout_schedule',
    type: 'enum',
    enum: PayoutSchedule,
    default: PayoutSchedule.MONTHLY,
  })
  payoutSchedule: PayoutSchedule;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks?: Record<string, string>;

  @Column({ name: 'promotion_methods', type: 'jsonb', nullable: true })
  promotionMethods?: string[];

  @Column({ name: 'application_note', type: 'text', nullable: true })
  applicationNote?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @VersionColumn()
  version: number;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
