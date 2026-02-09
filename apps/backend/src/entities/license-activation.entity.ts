import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('license_activations')
export class LicenseActivation extends BaseEntity {
  @Column({ name: 'license_id' })
  @Index()
  licenseId: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ name: 'machine_id', nullable: true })
  machineId: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'activated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  activatedAt: Date;

  @Column({ name: 'deactivated_at', type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne('License', 'activations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'license_id' })
  license: any;
}
