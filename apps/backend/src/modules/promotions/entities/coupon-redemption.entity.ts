import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Coupon } from './coupon.entity';

@Index(['couponId', 'userId'])
@Entity('coupon_redemptions')
export class CouponRedemption extends BaseEntity {
  @Index()
  @Column({ name: 'coupon_id', type: 'uuid' })
  couponId!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  discountAmount!: number;

  @Column({
    name: 'redeemed_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  redeemedAt!: Date;

  // Relations
  @ManyToOne(() => Coupon, (coupon) => coupon.redemptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;
}
