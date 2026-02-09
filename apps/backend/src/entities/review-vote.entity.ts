import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Review } from './review.entity';
import { VoteType } from '../modules/reviews/enums/review.enums';

@Entity('review_votes')
@Unique('UQ_review_vote_user', ['reviewId', 'userId'])
export class ReviewVote extends BaseEntity {
  @Column({ name: 'review_id' })
  @Index()
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'vote_type',
    type: 'enum',
    enum: VoteType,
  })
  voteType: VoteType;
}
