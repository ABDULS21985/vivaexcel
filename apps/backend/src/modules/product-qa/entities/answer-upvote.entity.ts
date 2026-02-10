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
import { ProductAnswer } from './product-answer.entity';

@Entity('answer_upvotes')
@Unique('UQ_answer_upvote', ['answerId', 'userId'])
export class AnswerUpvote extends BaseEntity {
  @Column({ name: 'answer_id' })
  @Index()
  answerId: string;

  @ManyToOne(() => ProductAnswer, { eager: false })
  @JoinColumn({ name: 'answer_id' })
  answer: ProductAnswer;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
