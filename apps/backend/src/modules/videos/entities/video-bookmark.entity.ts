import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Video } from './video.entity';

@Entity('video_bookmarks')
@Unique('UQ_video_bookmark_user_video', ['userId', 'videoId'])
export class VideoBookmark extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'video_id' })
  @Index()
  videoId: string;

  @ManyToOne(() => Video)
  @JoinColumn({ name: 'video_id' })
  video: Video;
}
