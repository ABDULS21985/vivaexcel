import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { ProductCategory } from './product-category.entity';
import { ProductFeature } from './product-feature.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Product extends BaseEntity {
  @Index()
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Index()
  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price!: number | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  sku!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status!: ProductStatus;

  @Column({ name: 'featured_image_id', type: 'uuid', nullable: true })
  featuredImageId!: string | null;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle!: string | null;

  @Index()
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  // Relations
  @ManyToOne(() => Organization, (organization) => organization.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: ProductCategory | null;

  @ManyToOne(() => MediaAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'featured_image_id' })
  featuredImage!: MediaAsset | null;

  @OneToMany(() => ProductFeature, (feature) => feature.product)
  features!: ProductFeature[];
}
