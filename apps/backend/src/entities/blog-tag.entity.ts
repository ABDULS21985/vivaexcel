import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';

@Entity('blog_tags')
export class BlogTag extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts?: Post[];

  @Column({ name: 'post_count', default: 0 })
  postCount: number;
}
