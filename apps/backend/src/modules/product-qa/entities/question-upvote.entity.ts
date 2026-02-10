import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';
import { ProductQuestion } from './product-question.entity';

@Entity('question_upvotes')
@Unique('UQ_question_upvote', ['questionId', 'userId'])
export class QuestionUpvote extends BaseEntity {
  @Column({ name: 'question_id' })
  @Index()
  questionId: string;

  @ManyToOne(() => ProductQuestion, { eager: false })
  @JoinColumn({ name: 'question_id' })
  question: ProductQuestion;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
