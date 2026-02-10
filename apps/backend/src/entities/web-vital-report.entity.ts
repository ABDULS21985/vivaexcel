import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { WebVitalMetric } from './performance-budget.entity';

export enum WebVitalRating {
  GOOD = 'GOOD',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  POOR = 'POOR',
}

@Entity('web_vital_reports')
@Index('IDX_wvr_route_metric_created', ['route', 'metricName', 'createdAt'])
export class WebVitalReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar' })
  @Index('IDX_wvr_route')
  route: string;

  @Column({ name: 'metric_name', type: 'enum', enum: WebVitalMetric })
  metricName: WebVitalMetric;

  @Column({ type: 'decimal', precision: 8, scale: 3 })
  value: number;

  @Column({ type: 'enum', enum: WebVitalRating })
  rating: WebVitalRating;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  country: string | null;

  @Column({ name: 'connection_type', type: 'varchar', nullable: true })
  connectionType: string | null;
}
