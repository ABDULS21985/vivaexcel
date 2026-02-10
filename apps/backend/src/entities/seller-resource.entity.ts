import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export enum ResourceType {
  TUTORIAL = 'tutorial',
  GUIDE = 'guide',
  VIDEO = 'video',
  BEST_PRACTICE = 'best_practice',
  SUCCESS_STORY = 'success_story',
}

@Entity('seller_resources')
export class SellerResource extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', unique: true })
  @Index()
  slug: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  type: ResourceType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  excerpt?: string;

  @Column({ name: 'video_url', type: 'varchar', nullable: true })
  videoUrl?: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;
}
