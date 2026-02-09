import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('flash_sales')
export class FlashSale extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'discount_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  discountPercentage!: number;

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

  @Index()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Column({
    name: 'featured_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  featuredImage!: string | null;

  @Column({
    name: 'original_prices',
    type: 'jsonb',
    nullable: true,
  })
  originalPrices!: Record<string, any> | null;

  @Column({
    name: 'max_purchases_per_user',
    type: 'int',
    nullable: true,
  })
  maxPurchasesPerUser!: number | null;

  // Relations
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'flash_sale_products',
    joinColumn: { name: 'flash_sale_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products!: Product[];
}
