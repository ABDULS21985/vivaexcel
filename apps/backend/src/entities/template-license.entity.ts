import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { WebTemplate, TemplateLicenseType } from './web-template.entity';
import { User } from './user.entity';

@Entity('template_licenses')
export class TemplateLicense extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  templateId: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  orderId: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true })
  licenseKey: string;

  @Column({ type: 'enum', enum: TemplateLicenseType })
  licenseType: TemplateLicenseType;

  @Column({ type: 'int', default: 0 })
  activationCount: number;

  @Column({ type: 'int', default: 1 })
  maxActivations: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => WebTemplate, (template) => template.licenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: WebTemplate;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;
}
