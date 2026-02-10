import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

@Entity('push_subscriptions')
export class PushSubscription extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'text' })
  endpoint!: string;

  @Column({ type: 'jsonb' })
  keys!: PushSubscriptionKeys;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null;

  @Column({ name: 'device_name', type: 'varchar', length: 100, nullable: true })
  deviceName!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
