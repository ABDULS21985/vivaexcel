import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export enum NewsletterSubscriberStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('newsletter_subscribers')
export class NewsletterSubscriber extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: NewsletterSubscriberStatus,
    default: NewsletterSubscriberStatus.PENDING,
  })
  status!: NewsletterSubscriberStatus;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt!: Date | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  source!: string | null;
}
