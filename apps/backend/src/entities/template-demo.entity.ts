import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { WebTemplate } from './web-template.entity';

@Entity('template_demos')
export class TemplateDemo extends BaseEntity {
  @Index()
  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'demo_url', type: 'varchar' })
  demoUrl: string;

  @Column({ name: 'screenshot_url', type: 'varchar', nullable: true })
  screenshotUrl: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  // Relations
  @ManyToOne(() => WebTemplate, (template) => template.demos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: WebTemplate;
}
