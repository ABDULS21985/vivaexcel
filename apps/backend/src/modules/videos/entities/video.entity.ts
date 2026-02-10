import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { VideoStatus } from '../enums/video.enums';
import { VideoChannel } from './video-channel.entity';
import { VideoCategory } from './video-category.entity';

@Entity('videos')
@Index(['publishedAt'])
@Index(['isShort', 'publishedAt'])
@Index(['categoryId', 'publishedAt'])
export class Video extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'thumbnail_url' })
  thumbnailUrl: string;

  @Column({ name: 'video_url' })
  videoUrl: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'channel_id' })
  @Index()
  channelId: string;

  @Column({ name: 'category_id' })
  @Index()
  categoryId: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'is_live', default: false })
  isLive: boolean;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;

  @Column({ name: 'is_short', default: false })
  isShort: boolean;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.DRAFT,
  })
  status: VideoStatus;

  // Relations

  @ManyToOne(() => VideoChannel, { eager: false })
  @JoinColumn({ name: 'channel_id' })
  channel: VideoChannel;

  @ManyToOne(() => VideoCategory, { eager: false })
  @JoinColumn({ name: 'category_id' })
  category: VideoCategory;
}
