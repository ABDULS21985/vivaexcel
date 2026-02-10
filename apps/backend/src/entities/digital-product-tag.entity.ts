import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DigitalProduct } from './digital-product.entity';
import { WebTemplate } from './web-template.entity';

@Entity('digital_product_tags')
export class DigitalProductTag extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => DigitalProduct, (product) => product.tags)
  products?: DigitalProduct[];

  @ManyToMany(() => WebTemplate, (template) => template.tags)
  templates?: WebTemplate[];
}
