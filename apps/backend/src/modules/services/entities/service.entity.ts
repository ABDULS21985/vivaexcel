import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { ServiceCategory } from './service-category.entity';

export enum ServiceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('services')
export class Service extends BaseEntity {
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

  @Column({ name: 'price_from', type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceFrom!: number | null;

  @Column({ name: 'price_to', type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceTo!: number | null;

  @Index()
  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.DRAFT,
  })
  status!: ServiceStatus;

  @Index()
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  // Relations
  @ManyToOne(() => Organization, (organization) => organization.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @ManyToOne(() => ServiceCategory, (category) => category.services, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: ServiceCategory | null;
}
