import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DigitalProduct } from './digital-product.entity';
import { DigitalProductFile } from './digital-product-file.entity';

@Entity('digital_product_variants')
export class DigitalProductVariant extends BaseEntity {
  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => DigitalProduct, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: DigitalProduct;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'jsonb', nullable: true })
  features?: string[];

  @Column({ name: 'file_id', nullable: true })
  fileId?: string;

  @ManyToOne(() => DigitalProductFile, { nullable: true })
  @JoinColumn({ name: 'file_id' })
  file?: DigitalProductFile;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
