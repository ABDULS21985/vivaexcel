import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum SellerApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('seller_applications')
export class SellerApplication extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'portfolio_urls', type: 'jsonb', nullable: true })
  portfolioUrls?: string[];

  @Column({ name: 'experience_description', type: 'text', nullable: true })
  experienceDescription?: string;

  @Column({ name: 'product_categories', type: 'jsonb', nullable: true })
  productCategories?: string[];

  @Column({ name: 'sample_work_urls', type: 'jsonb', nullable: true })
  sampleWorkUrls?: string[];

  @Column({
    type: 'enum',
    enum: SellerApplicationStatus,
    default: SellerApplicationStatus.PENDING,
  })
  @Index()
  status: SellerApplicationStatus;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes?: string;

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

  @Column({ name: 'application_note', type: 'text', nullable: true })
  applicationNote?: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User;
}
