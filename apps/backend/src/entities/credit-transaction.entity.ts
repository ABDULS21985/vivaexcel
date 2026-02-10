import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MarketplaceSubscription } from './marketplace-subscription.entity';
import { User } from './user.entity';
import { DigitalProduct } from './digital-product.entity';

export enum CreditTransactionType {
  CREDIT_GRANT = 'credit_grant',
  CREDIT_USED = 'credit_used',
  CREDIT_ROLLOVER = 'credit_rollover',
  CREDIT_EXPIRED = 'credit_expired',
  CREDIT_BONUS = 'credit_bonus',
  CREDIT_REFUND = 'credit_refund',
}

@Entity('credit_transactions')
export class CreditTransaction extends BaseEntity {
  @Column({ name: 'subscription_id' })
  @Index()
  subscriptionId: string;

  @ManyToOne(() => MarketplaceSubscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: MarketplaceSubscription;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: CreditTransactionType })
  @Index()
  type: CreditTransactionType;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int' })
  balance: number;

  @Column({ name: 'digital_product_id', nullable: true })
  @Index()
  digitalProductId?: string;

  @ManyToOne(() => DigitalProduct, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct?: DigitalProduct;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
