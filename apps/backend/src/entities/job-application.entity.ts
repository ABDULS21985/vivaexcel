import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum ApplicationStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  OFFERED = 'offered',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('job_applications')
export class JobApplication extends BaseEntity {
  // Applicant info
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  @Index()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  // Position info (denormalized from careers data)
  @Column({ name: 'position_id' })
  @Index()
  positionId: string;

  @Column({ name: 'position_title' })
  positionTitle: string;

  @Column()
  @Index()
  department: string;

  @Column({ nullable: true })
  location?: string;

  // Application content
  @Column({ type: 'text', nullable: true, name: 'cover_letter' })
  coverLetter?: string;

  @Column({ nullable: true, name: 'linkedin_url' })
  linkedinUrl?: string;

  @Column({ nullable: true, name: 'portfolio_url' })
  portfolioUrl?: string;

  // Resume file
  @Column({ name: 'resume_url' })
  resumeUrl: string;

  @Column({ name: 'resume_filename' })
  resumeFilename: string;

  @Column({ name: 'resume_size', type: 'integer' })
  resumeSize: number;

  // Status workflow
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.NEW,
  })
  @Index()
  status: ApplicationStatus;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'status_changed_at', nullable: true })
  statusChangedAt?: Date;

  // Internal notes
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Request metadata
  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
