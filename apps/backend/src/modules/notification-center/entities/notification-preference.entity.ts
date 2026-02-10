import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import {
  NotificationChannel,
  EmailDigestFrequency,
} from '../enums/notification.enums';

export interface NotificationCategories {
  orders: boolean;
  reviews: boolean;
  product_updates: boolean;
  promotions: boolean;
  community: boolean;
  achievements: boolean;
  price_drops: boolean;
  back_in_stock: boolean;
  newsletter: boolean;
  security: boolean;
}

export const DEFAULT_NOTIFICATION_CATEGORIES: NotificationCategories = {
  orders: true,
  reviews: true,
  product_updates: true,
  promotions: true,
  community: true,
  achievements: true,
  price_drops: true,
  back_in_stock: true,
  newsletter: true,
  security: true,
};

@Entity('notification_preferences')
export class NotificationPreference extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel!: NotificationChannel;

  @Column({
    type: 'jsonb',
    default: DEFAULT_NOTIFICATION_CATEGORIES,
  })
  categories!: NotificationCategories;

  @Column({ name: 'quiet_hours_enabled', type: 'boolean', default: false })
  quietHoursEnabled!: boolean;

  @Column({ name: 'quiet_hours_start', type: 'varchar', length: 5, nullable: true })
  quietHoursStart!: string | null;

  @Column({ name: 'quiet_hours_end', type: 'varchar', length: 5, nullable: true })
  quietHoursEnd!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone!: string;

  @Column({
    name: 'email_digest',
    type: 'enum',
    enum: EmailDigestFrequency,
    default: EmailDigestFrequency.INSTANT,
  })
  emailDigest!: EmailDigestFrequency;
}
