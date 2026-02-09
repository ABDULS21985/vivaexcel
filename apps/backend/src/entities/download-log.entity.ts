import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('download_logs')
export class DownloadLog extends BaseEntity {
  @Column({ name: 'download_link_id' })
  @Index()
  downloadLinkId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ nullable: true, length: 2 })
  country: string;

  @Column({ name: 'file_id', nullable: true })
  fileId: string;

  @Column({ name: 'downloaded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  downloadedAt: Date;

  @Column({ name: 'file_version', nullable: true })
  fileVersion: string;

  @Column({ name: 'bytes_transferred', type: 'bigint', default: 0 })
  bytesTransferred: number;

  @Column({ name: 'completed_successfully', type: 'boolean', default: false })
  completedSuccessfully: boolean;

  @ManyToOne('DownloadLink', 'downloadLogs', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'download_link_id' })
  downloadLink: any;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;
}
