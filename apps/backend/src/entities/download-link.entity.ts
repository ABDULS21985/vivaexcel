import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum DownloadLinkStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  EXHAUSTED = 'exhausted',
}

@Entity('download_links')
export class DownloadLink extends BaseEntity {
  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ name: 'order_item_id' })
  @Index()
  orderItemId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @Column({ name: 'variant_id', nullable: true })
  variantId: string;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column({ name: 'short_code', unique: true, length: 8 })
  @Index()
  shortCode: string;

  @Column({ type: 'enum', enum: DownloadLinkStatus, default: DownloadLinkStatus.ACTIVE })
  @Index()
  status: DownloadLinkStatus;

  @Column({ name: 'max_downloads', type: 'int', default: 5 })
  maxDownloads: number;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'last_downloaded_at', type: 'timestamp', nullable: true })
  lastDownloadedAt: Date;

  @ManyToOne('Order', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: any;

  @ManyToOne('OrderItem', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: any;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('DigitalProduct', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: any;

  @OneToMany('DownloadLog', 'downloadLink')
  downloadLogs: any[];
}
