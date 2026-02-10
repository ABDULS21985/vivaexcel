import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DigitalProduct } from './digital-product.entity';

export enum DigitalProductPreviewType {
  IMAGE = 'image',
  PDF_PREVIEW = 'pdf_preview',
  VIDEO = 'video',
  LIVE_DEMO_URL = 'live_demo_url',
  SLIDE_IMAGE = 'slide_image',
  CODE_SNIPPET = 'code_snippet',
  LIVE_SCREENSHOT = 'live_screenshot',
  INTERACTIVE_DEMO = 'interactive_demo',
}

export type PreviewGenerationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

@Entity('digital_product_previews')
export class DigitalProductPreview extends BaseEntity {
  @Column({ name: 'product_id' })
  @Index()
  productId: string;

  @ManyToOne(() => DigitalProduct, (product) => product.previews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: DigitalProduct;

  @Column({
    type: 'enum',
    enum: DigitalProductPreviewType,
  })
  type: DigitalProductPreviewType;

  @Column()
  url: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  label?: string;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ name: 'storage_key', nullable: true })
  storageKey?: string;

  @Column({ name: 'thumbnail_storage_key', nullable: true })
  thumbnailStorageKey?: string;

  @Column({ name: 'is_watermarked', default: false })
  isWatermarked: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'generation_status', default: 'completed' })
  generationStatus: PreviewGenerationStatus;

  @Column({ name: 'generation_error', type: 'text', nullable: true })
  generationError?: string;

  @Column({ name: 'generated_at', nullable: true })
  generatedAt?: Date;
}
