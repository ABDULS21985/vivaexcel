import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Service } from './service.entity';

@Entity('service_categories')
export class ServiceCategory extends BaseEntity {
  @Index()
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Self-referencing relations
  @ManyToOne(() => ServiceCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: ServiceCategory | null;

  @OneToMany(() => ServiceCategory, (category) => category.parent)
  children!: ServiceCategory[];

  // Service relations
  @OneToMany(() => Service, (service) => service.category)
  services!: Service[];
}
