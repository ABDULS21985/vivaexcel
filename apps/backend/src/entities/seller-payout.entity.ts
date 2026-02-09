import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SellerProfile } from './seller-profile.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('seller_payouts')
export class SellerPayout extends BaseEntity {
  @Column({ name: 'seller_id' })
  @Index()
  sellerId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 12, scale: 2 })
  platformFee: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ name: 'stripe_transfer_id', nullable: true })
  stripeTransferId?: string;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  @Index()
  status: PayoutStatus;

  @Column({ name: 'period_start', type: 'timestamp' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamp' })
  periodEnd: Date;

  @Column({ name: 'item_count', type: 'int', default: 0 })
  itemCount: number;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ManyToOne(() => SellerProfile)
  @JoinColumn({ name: 'seller_id' })
  seller: SellerProfile;
}
