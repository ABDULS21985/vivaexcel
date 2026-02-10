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
import { DiscussionThread } from './discussion-thread.entity';
import { DiscussionReplyLike } from './discussion-reply-like.entity';

@Entity('discussion_replies')
export class DiscussionReply extends BaseEntity {
  @Column({ name: 'thread_id' })
  @Index()
  threadId: string;

  @ManyToOne(() => DiscussionThread, (thread) => thread.replies, {
    eager: false,
  })
  @JoinColumn({ name: 'thread_id' })
  thread: DiscussionThread;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false, name: 'is_answer' })
  isAnswer: boolean;

  @Column({ type: 'int', default: 0, name: 'likes_count' })
  likesCount: number;

  @Column({ name: 'parent_id', type: 'varchar', nullable: true })
  parentId: string | null;

  @ManyToOne(() => DiscussionReply, (reply) => reply.children, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: DiscussionReply | null;

  @OneToMany(() => DiscussionReply, (reply) => reply.parent)
  children: DiscussionReply[];

  @OneToMany(() => DiscussionReplyLike, (like) => like.reply)
  likes: DiscussionReplyLike[];
}
