import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DigitalProduct } from './digital-product.entity';
import { User } from './user.entity';

@Entity('digital_product_files')
export class DigitalProductFile extends BaseEntity {
  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => DigitalProduct, (product) => product.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: DigitalProduct;

  @Column({ name: 'variant_id', nullable: true })
  variantId?: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_key' })
  fileKey: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ nullable: true })
  version?: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
  @Column({ default: 0 })
  order: number;
}
