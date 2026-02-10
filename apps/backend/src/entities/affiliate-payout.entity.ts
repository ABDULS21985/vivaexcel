import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AffiliateProfile } from './affiliate-profile.entity';
import { AffiliateCommission } from './affiliate-commission.entity';

export enum AffiliatePayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('affiliate_payouts')
export class AffiliatePayout extends BaseEntity {
  @Column({ name: 'affiliate_id' })
  @Index()
  affiliateId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 12, scale: 2, default: 0 })
  platformFee: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ name: 'stripe_transfer_id', nullable: true })
  stripeTransferId?: string;

  @Column({
    type: 'enum',
    enum: AffiliatePayoutStatus,
    default: AffiliatePayoutStatus.PENDING,
  })
  @Index()
  status: AffiliatePayoutStatus;

  @Column({ name: 'period_start', type: 'timestamp' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamp' })
  periodEnd: Date;

  @Column({ name: 'commission_count', type: 'int', default: 0 })
  commissionCount: number;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ManyToOne(() => AffiliateProfile)
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: AffiliateProfile;

  @OneToMany(() => AffiliateCommission, (c) => c.payout)
  commissions: AffiliateCommission[];
}
