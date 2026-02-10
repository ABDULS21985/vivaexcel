import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AffiliateLink } from './affiliate-link.entity';
import { AffiliateProfile } from './affiliate-profile.entity';

@Entity('affiliate_clicks')
@Index('IDX_affiliate_click_dedup', ['visitorIp', 'linkId', 'createdAt'])
export class AffiliateClick extends BaseEntity {
  @Column({ name: 'link_id' })
  @Index()
  linkId: string;

  @Column({ name: 'affiliate_id' })
  @Index()
  affiliateId: string;

  @Column({ name: 'visitor_ip' })
  visitorIp: string;

  @Column({ name: 'visitor_fingerprint', nullable: true })
  visitorFingerprint?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  device?: string;

  @Column({ nullable: true })
  browser?: string;

  @Column({ name: 'landing_page', nullable: true })
  landingPage?: string;

  @Column({ name: 'is_unique', default: true })
  isUnique: boolean;

  @Column({ name: 'converted_to_sale', default: false })
  convertedToSale: boolean;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @Column({ name: 'cookie_expires_at', type: 'timestamp', nullable: true })
  cookieExpiresAt?: Date;

  @Column({ name: 'session_id' })
  @Index()
  sessionId: string;

  // Relations
  @ManyToOne(() => AffiliateLink)
  @JoinColumn({ name: 'link_id' })
  link: AffiliateLink;

  @ManyToOne(() => AffiliateProfile)
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: AffiliateProfile;
}
