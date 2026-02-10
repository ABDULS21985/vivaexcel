import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('comparison_sets')
export class ComparisonSet extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'session_id', nullable: true })
  @Index()
  sessionId?: string;

  @Column({ type: 'jsonb', name: 'product_ids', default: '[]' })
  productIds!: string[];

  @Column({ nullable: true })
  name?: string;

  @Column({
    type: 'timestamptz',
    name: 'last_viewed_at',
    nullable: true,
  })
  lastViewedAt?: Date;
}
