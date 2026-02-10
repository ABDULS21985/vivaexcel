import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Video } from './video.entity';
import { User } from '../../../entities/user.entity';

@Entity('video_comments')
export class VideoComment extends BaseEntity {
  @Column({ name: 'video_id' })
  @Index()
  videoId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  // Relations

  @ManyToOne(() => Video)
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => VideoComment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: VideoComment;

  @OneToMany(() => VideoComment, (c) => c.parent)
  children: VideoComment[];
}
