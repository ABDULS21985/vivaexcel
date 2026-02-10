import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('video_categories')
export class VideoCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column()
  icon: string;

  @Column({ length: 7 })
  color: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
