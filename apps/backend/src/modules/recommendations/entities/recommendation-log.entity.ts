import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

export enum RecommendationType {
  CONTENT_BASED = 'content_based',
  COLLABORATIVE = 'collaborative',
  AI_POWERED = 'ai_powered',
  TRENDING = 'trending',
  PERSONALIZED = 'personalized',
}

@Entity('recommendation_logs')
export class RecommendationLog extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'session_id', nullable: true })
  @Index()
  sessionId?: string;

  @Column({ type: 'enum', enum: RecommendationType })
  type: RecommendationType;

  @Column({ name: 'source_product_id', nullable: true })
  sourceProductId?: string;

  @Column({ name: 'recommended_product_ids', type: 'jsonb', default: '[]' })
  recommendedProductIds: string[];

  @Column({ name: 'clicked_product_id', nullable: true })
  clickedProductId?: string;

  @Column({ name: 'converted', default: false })
  converted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
