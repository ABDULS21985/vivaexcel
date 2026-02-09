import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('product_similarities')
@Index(['productAId', 'productBId'], { unique: true })
export class ProductSimilarity extends BaseEntity {
  @Column({ name: 'product_a_id' })
  @Index()
  productAId: string;

  @Column({ name: 'product_b_id' })
  @Index()
  productBId: string;

  @Column({ name: 'similarity_score', type: 'decimal', precision: 5, scale: 4, default: 0 })
  similarityScore: number;

  @Column({ name: 'content_score', type: 'decimal', precision: 5, scale: 4, default: 0 })
  contentScore: number;

  @Column({ name: 'collaborative_score', type: 'decimal', precision: 5, scale: 4, default: 0 })
  collaborativeScore: number;

  @Column({ name: 'computed_at', type: 'timestamp' })
  computedAt: Date;
}
