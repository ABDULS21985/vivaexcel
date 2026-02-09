import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('engagement_models')
export class EngagementModel extends BaseEntity {
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

  @Column({ name: 'duration_range', type: 'varchar', length: 100, nullable: true })
  durationRange!: string | null;

  @Column({ name: 'typical_outputs', type: 'jsonb', nullable: true })
  typicalOutputs!: string[] | null;

  @Column({ type: 'varchar', length: 50 })
  icon!: string;

  @Column({ name: 'accent_color', type: 'varchar', length: 7, nullable: true })
  accentColor!: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
