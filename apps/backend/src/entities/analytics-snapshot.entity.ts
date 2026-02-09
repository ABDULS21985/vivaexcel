import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AnalyticsScope } from '../modules/marketplace-analytics/enums/analytics.enums';

@Entity('analytics_snapshots')
@Unique('UQ_snapshot_period_scope', ['period', 'scope', 'scopeId'])
export class AnalyticsSnapshot extends BaseEntity {
  @Column({ type: 'date' })
  @Index()
  period: Date;

  @Column({
    type: 'enum',
    enum: AnalyticsScope,
  })
  @Index()
  scope: AnalyticsScope;

  @Column({ name: 'scope_id', type: 'uuid', nullable: true })
  @Index()
  scopeId?: string;

  @Column({ type: 'jsonb' })
  metrics: Record<string, any>;
}
