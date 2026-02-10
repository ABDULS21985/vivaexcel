import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { DigitalProductType } from './digital-product.entity';
import { DigitalProductCategory } from './digital-product-category.entity';

export interface PriceRange {
  min: number;
  max: number;
}

export interface TopSellerMetrics {
  avgPrice: number;
  avgRating: number;
  avgMonthlySales: number;
}

@Entity('market_benchmarks')
@Index(['productType', 'categoryId'], { unique: true })
export class MarketBenchmark extends BaseEntity {
  @Column({
    name: 'product_type',
    type: 'enum',
    enum: DigitalProductType,
  })
  productType: DigitalProductType;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId?: string;

  @Column({
    name: 'average_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  averagePrice: number;

  @Column({
    name: 'median_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  medianPrice: number;

  @Column({ name: 'price_range', type: 'jsonb' })
  priceRange: PriceRange;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
  })
  averageRating: number;

  @Column({
    name: 'average_sales_per_month',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  averageSalesPerMonth: number;

  @Column({ name: 'top_seller_metrics', type: 'jsonb' })
  topSellerMetrics: TopSellerMetrics;

  @Column({ name: 'sample_size', type: 'int' })
  sampleSize: number;

  @Column({ name: 'calculated_at', type: 'timestamp', default: () => 'NOW()' })
  calculatedAt: Date;

  // Relations
  @ManyToOne(() => DigitalProductCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: DigitalProductCategory;
}
