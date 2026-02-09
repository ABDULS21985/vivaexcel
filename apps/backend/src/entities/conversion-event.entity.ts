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
import { ConversionEventType } from '../modules/marketplace-analytics/enums/analytics.enums';

@Entity('conversion_events')
export class ConversionEvent extends BaseEntity {
  @Column({ name: 'digital_product_id', nullable: true })
  @Index()
  digitalProductId?: string;

  @ManyToOne(() => DigitalProduct, { eager: false })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct?: DigitalProduct;

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
    name: 'event_type',
    type: 'enum',
    enum: ConversionEventType,
  })
  @Index()
  eventType: ConversionEventType;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'occurred_at', type: 'timestamp', default: () => 'NOW()' })
  @Index()
  occurredAt: Date;
}
