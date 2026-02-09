import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Post } from '../../../entities/post.entity';
import { User } from '../../../entities/user.entity';

@Entity('page_views')
export class PageView extends BaseEntity {
  @Column({ name: 'post_id', nullable: true })
  @Index()
  postId?: string;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'post_id' })
  post?: Post;

  @Column()
  path: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_hash', nullable: true })
  ipHash?: string;

  @Column({ name: 'session_id', nullable: true })
  @Index()
  sessionId?: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ nullable: true })
  country?: string;
}
