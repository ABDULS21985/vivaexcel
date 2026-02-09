import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../../entities/user.entity';
import { BlogCategory } from './blog-category.entity';
import { BlogTag } from './blog-tag.entity';
import { BlogComment } from './blog-comment.entity';

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('blog_posts')
export class BlogPost extends BaseEntity {
  @Index()
  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @Index()
  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: BlogPostStatus,
    default: BlogPostStatus.DRAFT,
  })
  status!: BlogPostStatus;

  @Index()
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount!: number;

  // Relations
  @ManyToOne(() => User, (user) => user.blogPosts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne(() => BlogCategory, (category) => category.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: BlogCategory | null;

  @ManyToMany(() => BlogTag, (tag) => tag.posts)
  @JoinTable({
    name: 'blog_post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: BlogTag[];

  @OneToMany(() => BlogComment, (comment) => comment.post)
  comments!: BlogComment[];
}
