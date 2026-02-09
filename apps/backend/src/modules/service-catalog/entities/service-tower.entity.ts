import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { CatalogService } from './catalog-service.entity';

@Entity('service_towers')
export class ServiceTower extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'short_name', type: 'varchar', length: 50 })
  shortName!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  scope!: string | null;

  @Column({ name: 'typical_outcomes', type: 'jsonb', nullable: true })
  typicalOutcomes!: string[] | null;

  @Column({ type: 'varchar', length: 50 })
  icon!: string;

  @Column({ name: 'accent_color', type: 'varchar', length: 7 })
  accentColor!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Index()
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  certifications!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  frameworks!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  // Relations
  @OneToMany(() => CatalogService, (service) => service.tower)
  services!: CatalogService[];
}
