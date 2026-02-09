import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ServiceTower } from './service-tower.entity';
import { ServiceDeliverable } from './service-deliverable.entity';

@Entity('catalog_services')
export class CatalogService extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  scope!: string | null;

  @Column({ type: 'varchar', length: 50 })
  icon!: string;

  @Index()
  @Column({ name: 'tower_id', type: 'uuid' })
  towerId!: string;

  @Column({ name: 'typical_deliverables', type: 'jsonb', nullable: true })
  typicalDeliverables!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  outcomes!: string[] | null;

  @Column({ name: 'engagement_types', type: 'jsonb', nullable: true })
  engagementTypes!: string[] | null;

  @Column({ name: 'duration_range', type: 'jsonb', nullable: true })
  durationRange!: { min: string; max: string } | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Index()
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ name: 'related_service_ids', type: 'jsonb', nullable: true })
  relatedServiceIds!: string[] | null;

  @Column({ name: 'industry_tags', type: 'jsonb', nullable: true })
  industryTags!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  // Relations
  @ManyToOne(() => ServiceTower, (tower) => tower.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tower_id' })
  tower!: ServiceTower;

  @OneToMany(() => ServiceDeliverable, (deliverable) => deliverable.service)
  deliverables!: ServiceDeliverable[];
}
