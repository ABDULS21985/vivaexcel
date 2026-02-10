import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';
import { DiscussionCategory } from './discussion-category.entity';
import { DiscussionReply } from './discussion-reply.entity';

@Entity('discussion_threads')
export class DiscussionThread extends BaseEntity {
  @Column({ name: 'category_id' })
  @Index()
  categoryId: string;

  @ManyToOne(() => DiscussionCategory, (category) => category.threads, {
    eager: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: DiscussionCategory;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 350, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: false, name: 'is_pinned' })
  isPinned: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_locked' })
  isLocked: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_closed' })
  isClosed: boolean;

  @Column({ type: 'int', default: 0, name: 'view_count' })
  viewCount: number;

  @Column({ type: 'int', default: 0, name: 'reply_count' })
  replyCount: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_reply_at' })
  lastReplyAt: Date | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @OneToMany(() => DiscussionReply, (reply) => reply.thread)
  replies: DiscussionReply[];
}
