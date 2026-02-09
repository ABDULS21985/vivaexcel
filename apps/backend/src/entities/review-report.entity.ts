import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Review } from './review.entity';
import {
  ReportReason,
  ReportStatus,
} from '../modules/reviews/enums/review.enums';

@Entity('review_reports')
export class ReviewReport extends BaseEntity {
  @Column({ name: 'review_id' })
  @Index()
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'reported_by' })
  @Index()
  reportedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reporter: User;

  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  @Index()
  status: ReportStatus;
}
