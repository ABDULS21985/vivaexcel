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

export enum SellerStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  IDENTITY_VERIFIED = 'identity_verified',
  BUSINESS_VERIFIED = 'business_verified',
}

export enum PayoutSchedule {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

@Entity('seller_profiles')
export class SellerProfile extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index({ unique: true })
  userId: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks?: Record<string, string>;

  @Column({ name: 'stripe_connect_account_id', nullable: true })
  stripeConnectAccountId?: string;

  @Column({ name: 'stripe_onboarding_complete', default: false })
  stripeOnboardingComplete: boolean;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 20.00,
  })
  commissionRate: number;

  @Column({
    type: 'enum',
    enum: SellerStatus,
    default: SellerStatus.PENDING_REVIEW,
  })
  @Index()
  status: SellerStatus;

  @Column({ name: 'total_sales', type: 'int', default: 0 })
  totalSales: number;

  @Column({
    name: 'total_revenue',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalRevenue: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
  })
  verificationStatus: VerificationStatus;

  @Column({
    name: 'payout_schedule',
    type: 'enum',
    enum: PayoutSchedule,
    default: PayoutSchedule.MONTHLY,
  })
  payoutSchedule: PayoutSchedule;

  @Column({
    name: 'minimum_payout',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 50.00,
  })
  minimumPayout: number;

  @Column({ type: 'jsonb', nullable: true })
  specialties?: string[];

  @Column({ name: 'application_note', type: 'text', nullable: true })
  applicationNote?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @VersionColumn()
  version: number;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
