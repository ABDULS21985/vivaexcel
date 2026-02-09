import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DigitalProduct } from './digital-product.entity';

@Entity('revenue_records')
export class RevenueRecord extends BaseEntity {
  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ name: 'seller_id', nullable: true })
  @Index()
  sellerId?: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'seller_id' })
  seller?: User;

  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @ManyToOne(() => DigitalProduct, { eager: false })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @Column({
    name: 'gross_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  grossAmount: number;

  @Column({
    name: 'platform_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  platformFee: number;

  @Column({
    name: 'seller_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  sellerAmount: number;

  @Column({
    name: 'coupon_discount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  couponDiscount: number;

  @Column({
    name: 'net_revenue',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  netRevenue: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'recorded_at', type: 'timestamp', default: () => 'NOW()' })
  @Index()
  recordedAt: Date;

  @Column({ type: 'date' })
  @Index()
  period: Date;
}
