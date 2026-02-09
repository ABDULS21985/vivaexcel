import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DigitalProduct } from './digital-product.entity';
import {
  TrafficSource,
  DeviceType,
} from '../modules/marketplace-analytics/enums/analytics.enums';

@Entity('product_views')
export class ProductView extends BaseEntity {
  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @ManyToOne(() => DigitalProduct, { eager: false })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'session_id' })
  @Index()
  sessionId: string;

  @Column({
    type: 'enum',
    enum: TrafficSource,
    default: TrafficSource.DIRECT,
  })
  @Index()
  source: TrafficSource;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ name: 'utm_source', nullable: true })
  utmSource?: string;

  @Column({ name: 'utm_medium', nullable: true })
  utmMedium?: string;

  @Column({ name: 'utm_campaign', nullable: true })
  utmCampaign?: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
    nullable: true,
  })
  deviceType?: DeviceType;

  @Column({ nullable: true })
  browser?: string;

  @Column({ nullable: true })
  os?: string;

  @Column({ length: 2, nullable: true })
  @Index()
  country?: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ name: 'scroll_depth', type: 'int', nullable: true })
  scrollDepth?: number;

  @Column({ name: 'viewed_at', type: 'timestamp', default: () => 'NOW()' })
  @Index()
  viewedAt: Date;
}
