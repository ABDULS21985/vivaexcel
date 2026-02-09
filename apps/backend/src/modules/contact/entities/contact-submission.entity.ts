import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Contact } from './contact.entity';

export enum ContactSubmissionStatus {
  NEW = 'new',
  READ = 'read',
  IN_PROGRESS = 'in_progress',
  REPLIED = 'replied',
  CLOSED = 'closed',
  SPAM = 'spam',
}

@Entity('contact_submissions')
export class ContactSubmission extends BaseEntity {
  @Index()
  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ContactSubmissionStatus,
    default: ContactSubmissionStatus.NEW,
  })
  status!: ContactSubmissionStatus;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'replied_at', type: 'timestamptz', nullable: true })
  repliedAt!: Date | null;

  // Relations
  @ManyToOne(() => Contact, (contact) => contact.submissions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'contact_id' })
  contact!: Contact | null;
}
