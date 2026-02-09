import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('reading_history')
export class ReadingHistory extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => User, (user) => user.readingHistory, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'post_id' })
  @Index()
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'read_percentage', type: 'int', default: 0 })
  readPercentage: number;

  @Column({ name: 'read_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  readAt: Date;
}
