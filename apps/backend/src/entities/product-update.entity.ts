import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('product_updates')
export class ProductUpdate extends BaseEntity {
  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @Column()
  version: string;

  @Column({ name: 'release_notes', type: 'text' })
  releaseNotes: string;

  @Column({ name: 'file_id', nullable: true })
  fileId: string;

  @Column({ name: 'is_breaking', type: 'boolean', default: false })
  isBreaking: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'notified_buyers', type: 'boolean', default: false })
  notifiedBuyers: boolean;

  @ManyToOne('DigitalProduct', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: any;
}
