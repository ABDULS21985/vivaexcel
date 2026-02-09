import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_categories')
export class ProductCategory extends BaseEntity {
  @Index()
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Self-referencing relations
  @ManyToOne(() => ProductCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: ProductCategory | null;

  @OneToMany(() => ProductCategory, (category) => category.parent)
  children!: ProductCategory[];

  // Product relations
  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
