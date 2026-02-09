import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('user_preference_profiles')
export class UserPreferenceProfile extends BaseEntity {
  @Column({ name: 'user_id', unique: true })
  @Index()
  userId: string;

  @Column({ name: 'preferred_categories', type: 'jsonb', default: '[]' })
  preferredCategories: string[];

  @Column({ name: 'preferred_types', type: 'jsonb', default: '[]' })
  preferredTypes: string[];

  @Column({ name: 'price_range_min', type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceRangeMin?: number;

  @Column({ name: 'price_range_max', type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceRangeMax?: number;

  @Column({ name: 'browsing_history', type: 'jsonb', default: '[]' })
  browsingHistory: string[];

  @Column({ name: 'purchase_history', type: 'jsonb', default: '[]' })
  purchaseHistory: string[];

  @Column({ name: 'feature_vector', type: 'jsonb', nullable: true })
  featureVector?: number[];

  @Column({ name: 'last_computed_at', type: 'timestamp', nullable: true })
  lastComputedAt?: Date;
}
