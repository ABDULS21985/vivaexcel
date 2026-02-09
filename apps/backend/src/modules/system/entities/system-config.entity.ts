import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('system_configs')
export class SystemConfig extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  key!: string;

  @Column({ type: 'jsonb', nullable: true })
  value!: unknown;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index()
  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic!: boolean;
}
