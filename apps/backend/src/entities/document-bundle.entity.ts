import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SolutionDocument } from './solution-document.entity';
import { DocumentStatus } from '../modules/solution-documents/enums/solution-document.enums';

@Entity('document_bundles')
export class DocumentBundle extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'bundle_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  bundlePrice: number;

  @Column({
    name: 'savings_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  savingsPercentage?: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations

  @ManyToMany(() => SolutionDocument)
  @JoinTable({
    name: 'document_bundle_items',
    joinColumn: { name: 'bundle_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'document_id', referencedColumnName: 'id' },
  })
  documents?: SolutionDocument[];
}
