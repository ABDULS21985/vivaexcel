import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum ServiceStatus {
  UP = 'UP',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
}

@Entity('service_statuses')
@Index('IDX_service_status_status', ['status'])
export class ServiceStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ name: 'service_name', type: 'varchar', unique: true })
  @Index('IDX_service_status_service_name')
  serviceName: string;

  @Column({ name: 'display_name', type: 'varchar' })
  displayName: string;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.UP })
  status: ServiceStatus;

  @Column({ type: 'int', nullable: true })
  latency: number | null;

  @Column({ name: 'last_checked_at', type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({
    name: 'uptime_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 100.0,
  })
  uptimePercentage: number;
}
