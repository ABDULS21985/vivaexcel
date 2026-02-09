import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';

@Entity('blog_categories')
export class BlogCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @ManyToOne(() => BlogCategory, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: BlogCategory;

  @OneToMany(() => BlogCategory, (category) => category.parent)
  children?: BlogCategory[];

  @OneToMany(() => Post, (post) => post.category)
  posts?: Post[];

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription?: string;
}
