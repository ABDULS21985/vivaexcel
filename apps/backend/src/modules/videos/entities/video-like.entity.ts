import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('video_likes')
@Unique('UQ_video_like_user_video', ['userId', 'videoId'])
export class VideoLike extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'video_id' })
  @Index()
  videoId: string;
}
