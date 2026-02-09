import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('product_categories')
export class ProductCategory extends BaseEntity {
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

  @ManyToOne(() => ProductCategory, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: ProductCategory;

  @OneToMany(() => ProductCategory, (category) => category.parent)
  children?: ProductCategory[];

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription?: string;
}
