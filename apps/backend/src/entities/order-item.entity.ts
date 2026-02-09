import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
import { DigitalProduct } from './digital-product.entity';
import { DownloadToken } from './download-token.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ name: 'digital_product_id' })
  digitalProductId: string;

  @Column({ name: 'variant_id', nullable: true })
  variantId?: string;

  @Column({ name: 'product_title' })
  productTitle: string;

  @Column({ name: 'product_slug' })
  productSlug: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  // Relations

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => DigitalProduct)
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @OneToMany(() => DownloadToken, (token) => token.orderItem)
  downloadTokens: DownloadToken[];
}
