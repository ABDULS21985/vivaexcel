import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export enum VolumeDiscountApplicableTo {
  ALL = 'all',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
}

@Entity('volume_discounts')
export class VolumeDiscount extends BaseEntity {
  @Index()
  @Column({ name: 'min_quantity', type: 'int' })
  minQuantity!: number;

  @Column({ name: 'max_quantity', type: 'int', nullable: true })
  maxQuantity!: number | null;

  @Column({
    name: 'discount_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  discountPercentage!: number;

  @Column({
    name: 'applicable_to',
    type: 'enum',
    enum: VolumeDiscountApplicableTo,
    default: VolumeDiscountApplicableTo.ALL,
  })
  applicableTo!: VolumeDiscountApplicableTo;

  @Column({ name: 'applicable_ids', type: 'jsonb', default: [] })
  applicableIds!: string[];

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
