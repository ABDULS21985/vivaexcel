import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SellerProfile } from './seller-profile.entity';

export enum InsightType {
  PRICING = 'pricing',
  LISTING_QUALITY = 'listing_quality',
  MARKETING = 'marketing',
  PERFORMANCE = 'performance',
  OPPORTUNITY = 'opportunity',
}

export enum InsightPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum InsightStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  ACTED_ON = 'acted_on',
  DISMISSED = 'dismissed',
}

export interface InsightActionItem {
  label: string;
  action: string;
  url?: string;
}

@Entity('seller_insights')
@Index(['sellerId', 'status'])
export class SellerInsight extends BaseEntity {
  @Column({ name: 'seller_id', type: 'uuid' })
  @Index()
  sellerId: string;

  @Column({
    name: 'insight_type',
    type: 'enum',
    enum: InsightType,
  })
  insightType: InsightType;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'action_items', type: 'jsonb' })
  actionItems: InsightActionItem[];

  @Column({
    type: 'enum',
    enum: InsightPriority,
  })
  priority: InsightPriority;

  @Column({
    type: 'enum',
    enum: InsightStatus,
    default: InsightStatus.PENDING,
  })
  status: InsightStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'generated_at', type: 'timestamp', default: () => 'NOW()' })
  @Index()
  generatedAt: Date;

  // Relations
  @ManyToOne(() => SellerProfile)
  @JoinColumn({ name: 'seller_id' })
  seller: SellerProfile;
}
