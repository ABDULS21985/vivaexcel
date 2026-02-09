import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('industry_practices')
export class IndustryPractice extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 50 })
  icon!: string;

  @Column({ name: 'accent_color', type: 'varchar', length: 7, nullable: true })
  accentColor!: string | null;

  @Column({ name: 'sub_sectors', type: 'jsonb', nullable: true })
  subSectors!: string[] | null;

  @Column({ name: 'key_offerings', type: 'jsonb', nullable: true })
  keyOfferings!: string[] | null;

  @Column({ name: 'related_tower_ids', type: 'jsonb', nullable: true })
  relatedTowerIds!: string[] | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
