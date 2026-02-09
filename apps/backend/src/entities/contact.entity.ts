import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
  ARCHIVED = 'archived',
  SPAM = 'spam',
}

@Entity('contacts')
export class Contact extends BaseEntity {
  @Column()
  name: string;

  @Column()
  @Index()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  company?: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.NEW })
  status: ContactStatus;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'read_at', nullable: true })
  readAt?: Date;

  @Column({ name: 'replied_at', nullable: true })
  repliedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
