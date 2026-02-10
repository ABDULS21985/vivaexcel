import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export enum WebVitalMetric {
  LCP = 'LCP',
  FID = 'FID',
  CLS = 'CLS',
  FCP = 'FCP',
  TTFB = 'TTFB',
  INP = 'INP',
}

@Entity('performance_budgets')
@Index('IDX_perf_budget_route_metric', ['route', 'metricName'], { unique: true })
export class PerformanceBudget extends BaseEntity {
  @Column({ type: 'varchar' })
  route: string;

  @Column({ name: 'metric_name', type: 'enum', enum: WebVitalMetric })
  metricName: WebVitalMetric;

  @Column({ name: 'budget_value', type: 'decimal', precision: 8, scale: 3 })
  budgetValue: number;

  @Column({ name: 'current_p75', type: 'decimal', precision: 8, scale: 3, nullable: true })
  currentP75: number | null;

  @Column({ name: 'current_p99', type: 'decimal', precision: 8, scale: 3, nullable: true })
  currentP99: number | null;

  @Column({ name: 'is_compliant', type: 'boolean', default: true })
  isCompliant: boolean;

  @Column({ name: 'sample_count', type: 'int', default: 0 })
  sampleCount: number;

  @Column({ name: 'last_reported_at', type: 'timestamp', nullable: true })
  lastReportedAt: Date | null;
}
