import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { CustomBundleStatus } from '../enums';

@Entity('custom_bundles')
export class CustomBundle extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'session_id', nullable: true })
  @Index()
  sessionId?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'jsonb', name: 'product_ids', default: '[]' })
  productIds!: string[];

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'total_retail_price',
    default: 0,
  })
  totalRetailPrice!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'bundle_price',
    default: 0,
  })
  bundlePrice!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  savings!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'discount_percentage',
    default: 0,
  })
  discountPercentage!: number;

  @Column({ type: 'int', name: 'discount_tier', default: 0 })
  discountTier!: number;

  @Column({
    type: 'enum',
    enum: CustomBundleStatus,
    default: CustomBundleStatus.DRAFT,
  })
  status!: CustomBundleStatus;

  @Column({ name: 'coupon_code', nullable: true, unique: true })
  couponCode?: string;

  @Column({ name: 'share_token', nullable: true, unique: true })
  @Index()
  shareToken?: string;
}
