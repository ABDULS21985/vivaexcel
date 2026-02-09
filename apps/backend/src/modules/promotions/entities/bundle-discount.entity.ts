import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('bundle_discounts')
export class BundleDiscount extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'bundle_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  bundlePrice!: number;

  @Column({
    name: 'regular_total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  regularTotalPrice!: number;

  @Column({
    name: 'savings_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  savingsPercentage!: number;

  @Index()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Index()
  @Column({
    name: 'starts_at',
    type: 'timestamptz',
  })
  startsAt!: Date;

  @Index()
  @Column({
    name: 'ends_at',
    type: 'timestamptz',
  })
  endsAt!: Date;

  // Relations
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'bundle_discount_products',
    joinColumn: { name: 'bundle_discount_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products!: Product[];
}
