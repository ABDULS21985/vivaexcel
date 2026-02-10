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
import { DiscussionReply } from './discussion-reply.entity';

@Entity('discussion_reply_likes')
@Unique('UQ_discussion_reply_like', ['replyId', 'userId'])
export class DiscussionReplyLike extends BaseEntity {
  @Column({ name: 'reply_id' })
  @Index()
  replyId: string;

  @ManyToOne(() => DiscussionReply, (reply) => reply.likes, { eager: false })
  @JoinColumn({ name: 'reply_id' })
  reply: DiscussionReply;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
