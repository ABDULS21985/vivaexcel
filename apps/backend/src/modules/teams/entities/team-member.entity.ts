import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Team } from './team.entity';
import { User } from '../../../entities/user.entity';

export enum TeamMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export interface TeamMemberPermissions {
  canPurchase: boolean;
  canDownload: boolean;
  canManageMembers: boolean;
  canViewAnalytics: boolean;
  canApproveRequests: boolean;
}

export const DEFAULT_PERMISSIONS: Record<TeamMemberRole, TeamMemberPermissions> = {
  [TeamMemberRole.OWNER]: {
    canPurchase: true,
    canDownload: true,
    canManageMembers: true,
    canViewAnalytics: true,
    canApproveRequests: true,
  },
  [TeamMemberRole.ADMIN]: {
    canPurchase: true,
    canDownload: true,
    canManageMembers: true,
    canViewAnalytics: true,
    canApproveRequests: true,
  },
  [TeamMemberRole.MANAGER]: {
    canPurchase: true,
    canDownload: true,
    canManageMembers: false,
    canViewAnalytics: true,
    canApproveRequests: true,
  },
  [TeamMemberRole.MEMBER]: {
    canPurchase: true,
    canDownload: true,
    canManageMembers: false,
    canViewAnalytics: false,
    canApproveRequests: false,
  },
  [TeamMemberRole.VIEWER]: {
    canPurchase: false,
    canDownload: false,
    canManageMembers: false,
    canViewAnalytics: false,
    canApproveRequests: false,
  },
};

@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMember extends BaseEntity {
  @Index()
  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.MEMBER,
  })
  role!: TeamMemberRole;

  @Column({ type: 'jsonb', default: {} })
  permissions!: TeamMemberPermissions;

  @Column({ name: 'invited_by', type: 'uuid', nullable: true })
  invitedBy!: string | null;

  @Column({ name: 'invited_at', type: 'timestamptz', nullable: true })
  invitedAt!: Date | null;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;

  @Column({ name: 'last_active_at', type: 'timestamptz', nullable: true })
  lastActiveAt!: Date | null;

  @Column({
    name: 'spend_limit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  spendLimit!: number | null;

  @Column({
    name: 'current_month_spend',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentMonthSpend!: number;

  // Relations
  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
