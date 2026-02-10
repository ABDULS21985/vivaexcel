import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Video } from './video.entity';

@Entity('video_views')
export class VideoView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'video_id' })
  @Index()
  videoId: string;

  @ManyToOne(() => Video)
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'ip_hash' })
  ipHash: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;
}
