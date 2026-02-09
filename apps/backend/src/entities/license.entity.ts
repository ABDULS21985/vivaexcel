import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum LicenseType {
  PERSONAL = 'personal',
  COMMERCIAL = 'commercial',
  EXTENDED = 'extended',
  ENTERPRISE = 'enterprise',
  UNLIMITED = 'unlimited',
}

export enum LicenseStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Entity('licenses')
export class License extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ name: 'license_key', unique: true })
  @Index()
  licenseKey: string;

  @Column({ name: 'license_type', type: 'enum', enum: LicenseType })
  licenseType: LicenseType;

  @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.ACTIVE })
  @Index()
  status: LicenseStatus;

  @Column({ name: 'activation_count', type: 'int', default: 0 })
  activationCount: number;

  @Column({ name: 'max_activations', type: 'int', default: 1 })
  maxActivations: number;

  @Column({ name: 'activated_domains', type: 'jsonb', default: [] })
  activatedDomains: string[];

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('DigitalProduct', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: any;

  @ManyToOne('Order', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: any;

  @OneToMany('LicenseActivation', 'license')
  activations: any[];
}
