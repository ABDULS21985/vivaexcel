import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DigitalProduct } from './digital-product.entity';
import { ReviewStatus } from '../modules/reviews/enums/review.enums';
import { ReviewVote } from './review-vote.entity';
import { ReviewReport } from './review-report.entity';

@Entity('reviews')
@Unique('UQ_review_user_product', ['userId', 'digitalProductId'])
export class Review extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @ManyToOne(() => DigitalProduct, { eager: false })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @Column({ type: 'int' })
  @Index()
  rating: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', default: [] })
  pros: string[];

  @Column({ type: 'jsonb', default: [] })
  cons: string[];

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING_MODERATION,
  })
  @Index()
  status: ReviewStatus;

  @Column({ name: 'is_verified_purchase', default: false })
  isVerifiedPurchase: boolean;

  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ name: 'not_helpful_count', type: 'int', default: 0 })
  notHelpfulCount: number;

  @Column({ name: 'seller_response', type: 'text', nullable: true })
  sellerResponse?: string;

  @Column({ name: 'seller_responded_at', type: 'timestamp', nullable: true })
  sellerRespondedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
  editedAt?: Date;

  // Relations

  @OneToMany(() => ReviewVote, (vote) => vote.review)
  votes?: ReviewVote[];

  @OneToMany(() => ReviewReport, (report) => report.review)
  reports?: ReviewReport[];
}
