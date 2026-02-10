import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MarketplaceSubscription } from './marketplace-subscription.entity';
import { User } from './user.entity';
import { DigitalProduct } from './digital-product.entity';

@Entity('subscription_downloads')
export class SubscriptionDownload extends BaseEntity {
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

  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @ManyToOne(() => DigitalProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @Column({ name: 'credits_cost', type: 'int' })
  creditsCost: number;

  @Column({ name: 'downloaded_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  downloadedAt: Date;

  @Column({ name: 'license_type', default: 'subscription' })
  licenseType: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'download_token', nullable: true })
  downloadToken?: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;
}
