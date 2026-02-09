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
  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar' })
  demoUrl: string;

  @Column({ type: 'varchar', nullable: true })
  screenshotUrl: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  // Relations
  @ManyToOne(() => WebTemplate, (template) => template.demos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: WebTemplate;
}
