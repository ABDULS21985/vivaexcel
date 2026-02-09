import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { BlogPost } from './blog-post.entity';
import { User } from '../../../entities/user.entity';

export enum BlogCommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam',
}

@Entity('blog_comments')
export class BlogComment extends BaseEntity {
  @Index()
  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Index()
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: BlogCommentStatus,
    default: BlogCommentStatus.PENDING,
  })
  status!: BlogCommentStatus;

  @Column({ name: 'author_name', type: 'varchar', length: 255, nullable: true })
  authorName!: string | null;

  @Column({ name: 'author_email', type: 'varchar', length: 255, nullable: true })
  authorEmail!: string | null;

  // Relations
  @ManyToOne(() => BlogPost, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: BlogPost;

  @ManyToOne(() => User, (user) => user.blogComments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  // Self-referencing relations for nested comments
  @ManyToOne(() => BlogComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: BlogComment | null;

  @OneToMany(() => BlogComment, (comment) => comment.parent)
  replies!: BlogComment[];
}
