import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AffiliateProfile } from './affiliate-profile.entity';

@Entity('affiliate_links')
export class AffiliateLink extends BaseEntity {
  @Column({ name: 'affiliate_id' })
  @Index()
  affiliateId: string;

  @Column({ name: 'digital_product_id', nullable: true })
  digitalProductId?: string;

  @Column({ name: 'short_code', unique: true })
  @Index()
  shortCode: string;

  @Column({ name: 'full_url' })
  fullUrl: string;

  @Column({ name: 'custom_campaign', nullable: true })
  customCampaign?: string;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ name: 'unique_clicks', type: 'int', default: 0 })
  uniqueClicks: number;

  @Column({ type: 'int', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commission: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => AffiliateProfile)
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: AffiliateProfile;
}
