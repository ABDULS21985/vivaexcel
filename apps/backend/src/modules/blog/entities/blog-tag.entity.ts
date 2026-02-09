import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { BlogPost } from './blog-post.entity';

@Entity('blog_tags')
export class BlogTag extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  // Relations
  @ManyToMany(() => BlogPost, (post) => post.tags)
  posts!: BlogPost[];
}
