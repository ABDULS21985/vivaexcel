import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductCategory } from './product-category.entity';
import { User } from './user.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice?: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ nullable: true })
  sku?: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage?: string;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => ProductCategory, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: ProductCategory;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription?: string;

  @Column({ name: 'meta_keywords', type: 'simple-array', nullable: true })
  metaKeywords?: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;
}
