import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Team } from './team.entity';

export enum TeamLicenseStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export interface SeatActivation {
  memberId: string;
  activatedAt: string;
}

@Entity('team_licenses')
export class TeamLicense extends BaseEntity {
  @Index()
  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @Index()
  @Column({ name: 'digital_product_id', type: 'uuid' })
  digitalProductId!: string;

  @Column({ name: 'license_type', type: 'varchar', length: 50, default: 'TEAM' })
  licenseType!: string;

  @Column({ name: 'seat_count', type: 'int' })
  seatCount!: number;

  @Column({ name: 'used_seats', type: 'int', default: 0 })
  usedSeats!: number;

  @Index({ unique: true })
  @Column({ name: 'license_key', type: 'varchar', length: 255, unique: true })
  licenseKey!: string;

  @Column({ type: 'jsonb', default: [] })
  activations!: SeatActivation[];

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TeamLicenseStatus,
    default: TeamLicenseStatus.ACTIVE,
  })
  status!: TeamLicenseStatus;

  // Relations
  @ManyToOne(() => Team, (team) => team.licenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @ManyToOne('DigitalProduct', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct!: any;
}
