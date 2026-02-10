import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';
import { ProductQuestion } from './product-question.entity';

@Entity('product_answers')
export class ProductAnswer extends BaseEntity {
  @Column({ name: 'question_id' })
  @Index()
  questionId: string;

  @ManyToOne(() => ProductQuestion, (question) => question.answers, { eager: false })
  @JoinColumn({ name: 'question_id' })
  question: ProductQuestion;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_seller_answer', default: false })
  isSellerAnswer: boolean;

  @Column({ name: 'is_accepted', default: false })
  isAccepted: boolean;

  @Column({ name: 'upvote_count', type: 'int', default: 0 })
  upvoteCount: number;
}
