import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export enum NewsletterStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NewsletterSegment {
  ALL = 'all',
  FREE = 'free',
  PAID = 'paid',
  BASIC = 'basic',
  PRO = 'pro',
  PREMIUM = 'premium',
}

@Entity('newsletters')
export class Newsletter extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ name: 'preheader_text', type: 'varchar', length: 255, nullable: true })
  preheaderText!: string | null;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: NewsletterStatus,
    default: NewsletterStatus.DRAFT,
  })
  status!: NewsletterStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: NewsletterSegment,
    default: NewsletterSegment.ALL,
  })
  segment!: NewsletterSegment;

  @Index()
  @Column({ name: 'scheduled_for', type: 'timestamptz', nullable: true })
  scheduledFor!: Date | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'recipient_count', type: 'int', default: 0 })
  recipientCount!: number;

  @Column({ name: 'open_count', type: 'int', default: 0 })
  openCount!: number;

  @Column({ name: 'click_count', type: 'int', default: 0 })
  clickCount!: number;

  // Keep backward compatibility with existing field
  @Column({ name: 'sent_count', type: 'int', default: 0 })
  sentCount!: number;

  // Keep backward compatibility
  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;
}
