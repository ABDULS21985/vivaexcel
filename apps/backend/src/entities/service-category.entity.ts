import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Service } from './service.entity';

@Entity('service_categories')
export class ServiceCategory extends BaseEntity {
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

  @ManyToOne(() => ServiceCategory, (category) => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: ServiceCategory;

  @OneToMany(() => ServiceCategory, (category) => category.parent)
  children?: ServiceCategory[];

  @OneToMany(() => Service, (service) => service.category)
  services?: Service[];

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
