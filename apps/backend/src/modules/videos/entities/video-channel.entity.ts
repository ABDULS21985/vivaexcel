import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('video_channels')
export class VideoChannel extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column()
  avatar: string;

  @Column({ name: 'subscriber_count', type: 'int', default: 0 })
  subscriberCount: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
