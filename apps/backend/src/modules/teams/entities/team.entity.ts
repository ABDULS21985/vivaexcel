import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../../entities/user.entity';
import { TeamMember } from './team-member.entity';
import { TeamInvitation } from './team-invitation.entity';
import { TeamPurchase } from './team-purchase.entity';
import { SharedLibraryItem } from './shared-library-item.entity';
import { TeamLicense } from './team-license.entity';

export enum TeamPlan {
  TEAM_STARTER = 'team_starter',
  TEAM_PROFESSIONAL = 'team_professional',
  TEAM_ENTERPRISE = 'team_enterprise',
}

@Entity('teams')
export class Team extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TeamPlan,
    default: TeamPlan.TEAM_STARTER,
  })
  plan!: TeamPlan;

  @Column({ name: 'max_members', type: 'int', default: 5 })
  maxMembers!: number;

  @Column({ name: 'owner_id', type: 'uuid' })
  @Index()
  ownerId!: string;

  @Column({ name: 'billing_email', type: 'varchar', length: 255, nullable: true })
  billingEmail!: string | null;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress!: Record<string, unknown> | null;

  @Column({ name: 'sso_enabled', type: 'boolean', default: false })
  ssoEnabled!: boolean;

  @Column({ name: 'sso_provider', type: 'varchar', length: 100, nullable: true })
  ssoProvider!: string | null;

  @Column({ name: 'sso_config', type: 'jsonb', nullable: true })
  ssoConfig!: Record<string, unknown> | null;

  @Column({ name: 'domain_verified', type: 'boolean', default: false })
  domainVerified!: boolean;

  @Column({ name: 'verified_domains', type: 'jsonb', default: [] })
  verifiedDomains!: string[];

  @Column({ name: 'shared_library_enabled', type: 'boolean', default: true })
  sharedLibraryEnabled!: boolean;

  @Column({ name: 'purchase_approval_required', type: 'boolean', default: false })
  purchaseApprovalRequired!: boolean;

  @Column({
    name: 'monthly_budget',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  monthlyBudget!: number | null;

  @Column({
    name: 'current_month_spend',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentMonthSpend!: number;

  @Column({ name: 'invoicing_enabled', type: 'boolean', default: false })
  invoicingEnabled!: boolean;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Relations
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => TeamMember, (member) => member.team)
  members!: TeamMember[];

  @OneToMany(() => TeamInvitation, (invitation) => invitation.team)
  invitations!: TeamInvitation[];

  @OneToMany(() => TeamPurchase, (purchase) => purchase.team)
  purchases!: TeamPurchase[];

  @OneToMany(() => SharedLibraryItem, (item) => item.team)
  sharedLibraryItems!: SharedLibraryItem[];

  @OneToMany(() => TeamLicense, (license) => license.team)
  licenses!: TeamLicense[];
}
