import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';

@Entity('download_tokens')
export class DownloadToken extends BaseEntity {
  @Column({ name: 'order_item_id' })
  @Index()
  orderItemId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'max_downloads', type: 'int', default: 5 })
  maxDownloads: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relations

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.downloadTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
