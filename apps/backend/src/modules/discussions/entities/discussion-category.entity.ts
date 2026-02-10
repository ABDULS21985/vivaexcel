import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { DiscussionThread } from './discussion-thread.entity';

@Entity('discussion_categories')
export class DiscussionCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @Column({ type: 'varchar', length: 20 })
  color: string;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @Column({ type: 'int', default: 0, name: 'thread_count' })
  threadCount: number;

  @OneToMany(() => DiscussionThread, (thread) => thread.category)
  threads: DiscussionThread[];
}
