import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export enum AlertCondition {
  GT = 'GT',
  LT = 'LT',
  EQ = 'EQ',
  GTE = 'GTE',
  LTE = 'LTE',
}

export enum AlertChannel {
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
}

@Entity('alert_rules')
@Index('IDX_alert_rule_is_active', ['isActive'])
export class AlertRule extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar' })
  metric: string;

  @Column({ type: 'enum', enum: AlertCondition })
  condition: AlertCondition;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  threshold: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({ name: 'evaluation_interval', type: 'int', default: 60 })
  evaluationInterval: number;

  @Column({ type: 'enum', enum: AlertChannel, default: AlertChannel.EMAIL })
  channel: AlertChannel;

  @Column({ type: 'jsonb', default: [] })
  recipients: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'cooldown_minutes', type: 'int', default: 30 })
  cooldownMinutes: number;

  @Column({ name: 'last_triggered_at', type: 'timestamp', nullable: true })
  lastTriggeredAt: Date | null;

  @Column({ name: 'last_value', type: 'decimal', precision: 12, scale: 4, nullable: true })
  lastValue: number | null;

  @Column({ name: 'trigger_count', type: 'int', default: 0 })
  triggerCount: number;
}
