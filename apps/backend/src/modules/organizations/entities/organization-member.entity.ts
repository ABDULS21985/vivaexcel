import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Organization } from './organization.entity';
import { User } from '../../../entities/user.entity';

export enum OrganizationMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

@Entity('organization_members')
@Unique(['organizationId', 'userId'])
export class OrganizationMember extends BaseEntity {
  @Index()
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: OrganizationMemberRole,
    default: OrganizationMemberRole.MEMBER,
  })
  role!: OrganizationMemberRole;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;

  // Relations
  @ManyToOne(() => Organization, (organization) => organization.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @ManyToOne(() => User, (user) => user.organizationMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
