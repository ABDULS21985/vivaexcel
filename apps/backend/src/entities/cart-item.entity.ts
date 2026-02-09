import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Cart } from './cart.entity';
import { DigitalProduct } from './digital-product.entity';
import { DigitalProductVariant } from './digital-product-variant.entity';

@Entity('cart_items')
@Unique(['cartId', 'digitalProductId', 'variantId'])
export class CartItem extends BaseEntity {
  @Column({ name: 'cart_id' })
  @Index()
  cartId: string;

  @Column({ name: 'digital_product_id' })
  digitalProductId: string;

  @Column({ name: 'variant_id', nullable: true })
  variantId?: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitPrice: number;

  @Column({ default: 'USD' })
  currency: string;

  // Relations

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => DigitalProduct)
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @ManyToOne(() => DigitalProductVariant, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant?: DigitalProductVariant;
}
