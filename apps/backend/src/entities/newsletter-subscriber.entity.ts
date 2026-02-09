import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum SubscriberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('newsletter_subscribers')
export class NewsletterSubscriber extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'enum', enum: SubscriberStatus, default: SubscriberStatus.PENDING })
  status: SubscriberStatus;

  @Column({ name: 'confirmation_token', nullable: true })
  confirmationToken?: string;

  @Column({ name: 'confirmed_at', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'unsubscribed_at', nullable: true })
  unsubscribedAt?: Date;

  @Column({ name: 'unsubscribe_token', nullable: true })
  unsubscribeToken?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
