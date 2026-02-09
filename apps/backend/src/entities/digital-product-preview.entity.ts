import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DigitalProduct } from './digital-product.entity';

export enum DigitalProductPreviewType {
  IMAGE = 'image',
  PDF_PREVIEW = 'pdf_preview',
  VIDEO = 'video',
  LIVE_DEMO_URL = 'live_demo_url',
}

@Entity('digital_product_previews')
export class DigitalProductPreview extends BaseEntity {
  @Column({ name: 'product_id' })
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
}
