import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum MarketplacePlanSlug {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum AccessLevel {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ALL = 'all',
}

@Entity('marketplace_plans')
export class MarketplacePlan extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'monthly_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ name: 'annual_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  annualPrice: number;

  @Column({ name: 'monthly_credits', type: 'int', default: 0 })
  monthlyCredits: number;

  @Column({ name: 'rollover_credits', default: false })
  rolloverCredits: boolean;

  @Column({ name: 'max_rollover_credits', type: 'int', default: 0 })
  maxRolloverCredits: number;

  @Column({ name: 'simultaneous_downloads', type: 'int', default: 1 })
  simultaneousDownloads: number;

  @Column({ name: 'access_level', type: 'enum', enum: AccessLevel, default: AccessLevel.FREE })
  accessLevel: AccessLevel;

  @Column({ name: 'included_product_types', type: 'jsonb', default: [] })
  includedProductTypes: string[];

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({ name: 'stripe_price_id_monthly', nullable: true })
  stripePriceIdMonthly?: string;

  @Column({ name: 'stripe_price_id_annual', nullable: true })
  stripePriceIdAnnual?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'trial_days', type: 'int', default: 0 })
  trialDays: number;
}
