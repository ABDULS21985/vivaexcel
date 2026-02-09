import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
  Index,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DigitalProductCategory } from './digital-product-category.entity';
import { DigitalProductTag } from './digital-product-tag.entity';
import { DigitalProductVariant } from './digital-product-variant.entity';
import { DigitalProductFile } from './digital-product-file.entity';
import { DigitalProductPreview } from './digital-product-preview.entity';

export enum DigitalProductType {
  POWERPOINT = 'powerpoint',
  DOCUMENT = 'document',
  WEB_TEMPLATE = 'web_template',
  STARTUP_KIT = 'startup_kit',
  SOLUTION_TEMPLATE = 'solution_template',
  DESIGN_SYSTEM = 'design_system',
  CODE_TEMPLATE = 'code_template',
  OTHER = 'other',
}

export enum DigitalProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  COMING_SOON = 'coming_soon',
}

@Entity('digital_products')
export class DigitalProduct extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription?: string;

  @Column({
    type: 'enum',
    enum: DigitalProductType,
  })
  type: DigitalProductType;

  @Column({
    type: 'enum',
    enum: DigitalProductStatus,
    default: DigitalProductStatus.DRAFT,
  })
  status: DigitalProductStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  compareAtPrice?: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage?: string;

  @Column({ name: 'gallery_images', type: 'jsonb', nullable: true })
  galleryImages?: string[];

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_bestseller', default: false })
  isBestseller: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'seo_title', nullable: true })
  seoTitle?: string;

  @Column({ name: 'seo_description', nullable: true })
  seoDescription?: string;

  @Column({ name: 'seo_keywords', type: 'simple-array', nullable: true })
  seoKeywords?: string[];

  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'published_at', nullable: true })
  publishedAt?: Date;

  @VersionColumn()
  version: number;

  // Relations

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => DigitalProductCategory, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category?: DigitalProductCategory;

  @ManyToMany(() => DigitalProductTag, (tag) => tag.products)
  @JoinTable({
    name: 'digital_product_tag_relations',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: DigitalProductTag[];

  @OneToMany(() => DigitalProductVariant, (variant) => variant.product)
  variants?: DigitalProductVariant[];

  @OneToMany(() => DigitalProductFile, (file) => file.product)
  files?: DigitalProductFile[];

  @OneToMany(() => DigitalProductPreview, (preview) => preview.product)
  previews?: DigitalProductPreview[];
}
