import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Team } from './team.entity';

@Entity('shared_library_items')
@Unique(['teamId', 'digitalProductId'])
export class SharedLibraryItem extends BaseEntity {
  @Index()
  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @Index()
  @Column({ name: 'digital_product_id', type: 'uuid' })
  digitalProductId!: string;

  @Column({ name: 'added_by', type: 'uuid' })
  addedBy!: string;

  @Column({ name: 'license_id', type: 'uuid', nullable: true })
  licenseId!: string | null;

  @Column({ name: 'access_count', type: 'int', default: 0 })
  accessCount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'jsonb', default: [] })
  tags!: string[];

  // Relations
  @ManyToOne(() => Team, (team) => team.sharedLibraryItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @ManyToOne('TeamMember', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'added_by' })
  addedByMember!: any;

  @ManyToOne('DigitalProduct', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct!: any;

  @ManyToOne('License', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'license_id' })
  license!: any;
}
