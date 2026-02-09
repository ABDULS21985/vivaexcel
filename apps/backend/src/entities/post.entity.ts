import { Entity, Column, ManyToOne, ManyToMany, OneToMany, JoinColumn, JoinTable, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogCategory } from './blog-category.entity';
import { BlogTag } from './blog-tag.entity';
import { Comment } from './comment.entity';
import { User } from './user.entity';
import { PostRevision } from './post-revision.entity';
import { PostSeries } from './post-series.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

export enum PostVisibility {
  PUBLIC = 'public',
  MEMBERS = 'members',
  PAID = 'paid',
}

export enum MembershipTierLevel {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  PREMIUM = 'premium',
}

@Entity('posts')
export class Post extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  @Index()
  visibility: PostVisibility;

  @Column({
    name: 'minimum_tier',
    type: 'enum',
    enum: MembershipTierLevel,
    nullable: true,
  })
  minimumTier?: MembershipTierLevel;

  @Column({ nullable: true })
  series?: string;

  @Column({ name: 'series_id', nullable: true })
  @Index()
  seriesId?: string;

  @ManyToOne(() => PostSeries, (postSeries) => postSeries.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'series_id' })
  postSeries?: PostSeries;

  @Column({ name: 'series_order', type: 'int', nullable: true })
  seriesOrder?: number;

  @Column({ name: 'canonical_url', nullable: true })
  canonicalUrl?: string;

  @Column({ name: 'no_index', default: false })
  noIndex: boolean;

  @Column({ name: 'word_count', type: 'int', default: 0 })
  wordCount: number;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage?: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => BlogCategory, (category) => category.posts, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: BlogCategory;

  @ManyToMany(() => BlogTag, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: BlogTag[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments?: Comment[];

  @OneToMany(() => PostRevision, (revision) => revision.post)
  revisions?: PostRevision[];

  @Column({ name: 'published_at', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt?: Date;

  @Column({ default: 0 })
  views: number;

  @Column({ name: 'reading_time', nullable: true })
  readingTime?: number;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription?: string;

  @Column({ name: 'meta_keywords', type: 'simple-array', nullable: true })
  metaKeywords?: string[];

  @Column({ name: 'allow_comments', default: true })
  allowComments: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;
}
