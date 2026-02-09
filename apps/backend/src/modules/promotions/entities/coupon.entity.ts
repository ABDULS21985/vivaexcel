import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import {
  DiscountType,
  CouponApplicableTo,
} from '../enums/promotion.enums';
import { CouponRedemption } from './coupon-redemption.entity';

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
  })
  discountType!: DiscountType;

  @Column({
    name: 'discount_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  discountValue!: number;

  @Column({ type: 'varchar', length: 3, nullable: true, default: 'USD' })
  currency!: string | null;

  @Column({
    name: 'minimum_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  minimumOrderAmount!: number | null;

  @Column({
    name: 'maximum_discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maximumDiscountAmount!: number | null;

  @Column({
    name: 'applicable_to',
    type: 'enum',
    enum: CouponApplicableTo,
    default: CouponApplicableTo.ALL_PRODUCTS,
  })
  applicableTo!: CouponApplicableTo;

  @Column({
    name: 'applicable_product_ids',
    type: 'jsonb',
    nullable: true,
  })
  applicableProductIds!: string[] | null;

  @Column({
    name: 'applicable_category_ids',
    type: 'jsonb',
    nullable: true,
  })
  applicableCategoryIds!: string[] | null;

  @Column({
    name: 'applicable_product_types',
    type: 'jsonb',
    nullable: true,
  })
  applicableProductTypes!: string[] | null;

  @Column({
    name: 'applicable_seller_ids',
    type: 'jsonb',
    nullable: true,
  })
  applicableSellerIds!: string[] | null;

  @Column({
    name: 'usage_limit',
    type: 'int',
    nullable: true,
  })
  usageLimit!: number | null;

  @Column({
    name: 'usage_limit_per_user',
    type: 'int',
    default: 1,
  })
  usageLimitPerUser!: number;

  @Column({
    name: 'current_usage_count',
    type: 'int',
    default: 0,
  })
  currentUsageCount!: number;

  @Index()
  @Column({
    name: 'starts_at',
    type: 'timestamptz',
  })
  startsAt!: Date;

  @Index()
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  @Index()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Index()
  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 36,
  })
  createdBy!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  // Relations
  @OneToMany(() => CouponRedemption, (redemption) => redemption.coupon)
  redemptions!: CouponRedemption[];
}
