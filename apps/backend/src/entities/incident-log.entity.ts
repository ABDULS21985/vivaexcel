import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export enum IncidentSeverity {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
}

export enum IncidentStatus {
  INVESTIGATING = 'INVESTIGATING',
  IDENTIFIED = 'IDENTIFIED',
  MONITORING = 'MONITORING',
  RESOLVED = 'RESOLVED',
}

export interface IncidentTimelineEntry {
  timestamp: string;
  update: string;
  author?: string;
}

@Entity('incident_logs')
@Index('IDX_incident_severity', ['severity'])
@Index('IDX_incident_status', ['status'])
@Index('IDX_incident_started_at', ['startedAt'])
export class IncidentLog extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: IncidentSeverity })
  severity: IncidentSeverity;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.INVESTIGATING })
  status: IncidentStatus;

  @Column({ name: 'services_affected', type: 'jsonb', default: [] })
  servicesAffected: string[];

  @Column({ type: 'jsonb', default: [] })
  timeline: IncidentTimelineEntry[];

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'NOW()' })
  startedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'postmortem_url', type: 'varchar', nullable: true })
  postmortemUrl: string | null;

  @Column({ name: 'acknowledged_by', type: 'varchar', nullable: true })
  acknowledgedBy: string | null;
}
