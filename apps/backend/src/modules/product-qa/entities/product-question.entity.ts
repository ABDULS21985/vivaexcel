import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';
import { DigitalProduct } from '../../../entities/digital-product.entity';
import { ProductAnswer } from './product-answer.entity';
import { QAStatus } from '../enums/qa.enums';

@Entity('product_questions')
export class ProductQuestion extends BaseEntity {
  @Column({ name: 'product_id' })
  @Index()
  productId: string;

  @ManyToOne(() => DigitalProduct, { eager: false })
  @JoinColumn({ name: 'product_id' })
  product: DigitalProduct;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: QAStatus,
    default: QAStatus.APPROVED,
  })
  @Index()
  status: QAStatus;

  @Column({ name: 'answer_count', type: 'int', default: 0 })
  answerCount: number;

  @Column({ name: 'upvote_count', type: 'int', default: 0 })
  upvoteCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => ProductAnswer, (answer) => answer.question)
  answers: ProductAnswer[];
}
