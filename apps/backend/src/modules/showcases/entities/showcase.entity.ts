import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';
import { DigitalProduct } from '../../../entities/digital-product.entity';
import { ShowcaseStatus } from '../enums/showcase.enums';
import { ShowcaseLike } from './showcase-like.entity';
import { ShowcaseComment } from './showcase-comment.entity';

@Entity('showcases')
export class Showcase extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'product_id' })
  @Index()
  productId: string;

  @ManyToOne(() => DigitalProduct, { eager: false })
  @JoinColumn({ name: 'product_id' })
  product: DigitalProduct;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ name: 'project_url', length: 500, nullable: true })
  projectUrl?: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ShowcaseStatus,
    default: ShowcaseStatus.PENDING,
  })
  @Index()
  status: ShowcaseStatus;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  commentsCount: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations

  @OneToMany(() => ShowcaseLike, (like) => like.showcase)
  likes: ShowcaseLike[];

  @OneToMany(() => ShowcaseComment, (comment) => comment.showcase)
  comments: ShowcaseComment[];
}
