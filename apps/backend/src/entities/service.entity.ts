import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ServiceCategory } from './service-category.entity';
import { User } from './user.entity';

export enum ServiceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('services')
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ name: 'price_type', nullable: true })
  priceType?: string; // 'fixed', 'hourly', 'project', 'custom'

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.DRAFT })
  status: ServiceStatus;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage?: string;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => ServiceCategory, (category) => category.services, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: ServiceCategory;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'simple-array', nullable: true })
  features?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription?: string;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;
}
