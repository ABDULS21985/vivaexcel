import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AffiliateProfile } from './affiliate-profile.entity';
import { AffiliatePayout } from './affiliate-payout.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REVERSED = 'reversed',
}

export enum AttributionType {
  LAST_CLICK = 'last_click',
  FIRST_CLICK = 'first_click',
  COOKIE = 'cookie',
}

@Entity('affiliate_commissions')
@Index('IDX_commission_affiliate_status', ['affiliateId', 'status'])
@Index('IDX_commission_order_status', ['orderId', 'status'])
export class AffiliateCommission extends BaseEntity {
  @Column({ name: 'affiliate_id' })
  @Index()
  affiliateId: string;

  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @Column({ name: 'product_id', nullable: true })
  productId?: string;

  @Column({ name: 'click_id', nullable: true })
  clickId?: string;

  @Column({ name: 'link_id', nullable: true })
  linkId?: string;

  @Column({
    name: 'sale_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  saleAmount: number;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  commissionRate: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  commissionAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  @Index()
  status: CommissionStatus;

  @Column({
    name: 'attribution_type',
    type: 'enum',
    enum: AttributionType,
    default: AttributionType.LAST_CLICK,
  })
  attributionType: AttributionType;

  @Column({ name: 'cookie_set_at', type: 'timestamp', nullable: true })
  cookieSetAt?: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ name: 'payout_id', nullable: true })
  payoutId?: string;

  @Column({ default: false })
  flagged: boolean;

  @Column({ name: 'flag_reason', nullable: true })
  flagReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ManyToOne(() => AffiliateProfile)
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: AffiliateProfile;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => AffiliatePayout, { nullable: true })
  @JoinColumn({ name: 'payout_id' })
  payout?: AffiliatePayout;
}
