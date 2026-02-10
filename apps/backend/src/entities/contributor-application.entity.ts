import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum ContributorApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('contributor_applications')
export class ContributorApplication extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: ContributorApplicationStatus,
    default: ContributorApplicationStatus.PENDING,
  })
  @Index()
  status: ContributorApplicationStatus;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks?: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  specialties?: string[];

  @Column({ name: 'portfolio_urls', type: 'jsonb', nullable: true })
  portfolioUrls?: string[];

  @Column({ name: 'sample_work_urls', type: 'jsonb', nullable: true })
  sampleWorkUrls?: string[];

  @Column({ name: 'experience_description', type: 'text', nullable: true })
  experienceDescription?: string;

  @Column({ name: 'content_categories', type: 'jsonb', nullable: true })
  contentCategories?: string[];

  @Column({ name: 'application_note', type: 'text', nullable: true })
  applicationNote?: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes?: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User;
}
