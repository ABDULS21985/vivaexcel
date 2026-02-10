import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { WebTemplate } from './web-template.entity';
import { LicenseType } from './web-template.enums';
import { User } from './user.entity';

@Entity('template_licenses')
export class TemplateLicense extends BaseEntity {
  @Index()
  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Index({ unique: true })
  @Column({ name: 'license_key', type: 'varchar', unique: true })
  licenseKey: string;

  @Column({ name: 'license_type', type: 'enum', enum: LicenseType })
  licenseType: LicenseType;

  @Column({ name: 'activation_count', type: 'int', default: 0 })
  activationCount: number;

  @Column({ name: 'max_activations', type: 'int', default: 1 })
  maxActivations: number;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => WebTemplate, (template) => template.licenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: WebTemplate;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
