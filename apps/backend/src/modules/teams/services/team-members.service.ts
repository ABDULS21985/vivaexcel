import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Team } from '../entities/team.entity';
import { TeamMember, TeamMemberRole, DEFAULT_PERMISSIONS } from '../entities/team-member.entity';
import { TeamInvitation, InvitationStatus } from '../entities/team-invitation.entity';
import { InviteMembersDto } from '../dto/invite-members.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';
import { UpdateMemberSpendLimitDto } from '../dto/update-member-spend-limit.dto';
import { CacheService } from '../../../common/cache/cache.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_TAG = 'teams';
const INVITATION_EXPIRY_DAYS = 7;

@Injectable()
export class TeamMembersService {
  private readonly logger = new Logger(TeamMembersService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
    @InjectRepository(TeamInvitation)
    private readonly invitationRepository: Repository<TeamInvitation>,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Get members
  // ──────────────────────────────────────────────

  async getMembers(
    teamId: string,
    userId: string,
  ): Promise<ApiResponse<TeamMember[]>> {
    const requester = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!requester) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const members = await this.memberRepository.find({
      where: { teamId },
      relations: ['user'],
      order: { role: 'ASC', joinedAt: 'ASC' },
    });

    return {
      status: 'success',
      message: 'Members retrieved successfully',
      data: members,
    };
  }

  // ──────────────────────────────────────────────
  //  Invite members
  // ──────────────────────────────────────────────

  async inviteMembers(
    teamId: string,
    userId: string,
    dto: InviteMembersDto,
  ): Promise<ApiResponse<TeamInvitation[]>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const requester = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!requester || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(requester.role)) {
      throw new ForbiddenException('Only owners and admins can invite members');
    }

    // Check member limit
    const currentCount = await this.memberRepository.count({ where: { teamId } });
    if (currentCount + dto.emails.length > team.maxMembers) {
      throw new BadRequestException(
        `Cannot invite ${dto.emails.length} members. Team limit is ${team.maxMembers}, currently ${currentCount} members.`,
      );
    }

    const role = dto.role || TeamMemberRole.MEMBER;
    const invitations: TeamInvitation[] = [];

    for (const email of dto.emails) {
      // Check if already a member
      const existingMember = await this.memberRepository
        .createQueryBuilder('tm')
        .innerJoin('tm.user', 'u')
        .where('tm.teamId = :teamId', { teamId })
        .andWhere('u.email = :email', { email })
        .getOne();

      if (existingMember) {
        this.logger.warn(`User ${email} is already a member of team ${teamId}`);
        continue;
      }

      // Check for existing pending invitation
      const existingInvitation = await this.invitationRepository.findOne({
        where: { teamId, email, status: InvitationStatus.PENDING },
      });
      if (existingInvitation) {
        this.logger.warn(`Pending invitation already exists for ${email} in team ${teamId}`);
        continue;
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

      const invitation = this.invitationRepository.create({
        teamId,
        email,
        role,
        invitedBy: userId,
        token,
        status: InvitationStatus.PENDING,
        expiresAt,
        sentAt: new Date(),
      });

      const saved = await this.invitationRepository.save(invitation);
      invitations.push(saved);

      this.logger.log(`Invitation sent to ${email} for team ${teamId} with token ${token}`);
    }

    return {
      status: 'success',
      message: `${invitations.length} invitation(s) sent successfully`,
      data: invitations,
    };
  }

  // ──────────────────────────────────────────────
  //  Accept invitation
  // ──────────────────────────────────────────────

  async acceptInvitation(
    token: string,
    userId: string,
  ): Promise<ApiResponse<TeamMember>> {
    const invitation = await this.invitationRepository.findOne({
      where: { token, status: InvitationStatus.PENDING },
      relations: ['team'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already used');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    // Check if already a member
    const existingMember = await this.memberRepository.findOne({
      where: { teamId: invitation.teamId, userId },
    });
    if (existingMember) {
      throw new BadRequestException('You are already a member of this team');
    }

    // Create member
    const member = this.memberRepository.create({
      teamId: invitation.teamId,
      userId,
      role: invitation.role,
      permissions: DEFAULT_PERMISSIONS[invitation.role],
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.sentAt,
      joinedAt: new Date(),
    });

    const savedMember = await this.memberRepository.save(member);

    // Update invitation
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await this.invitationRepository.save(invitation);

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${invitation.teamId}`,
      `${CACHE_TAG}:user:${userId}`,
      `${CACHE_TAG}:${invitation.teamId}:stats`,
    ]);

    this.logger.log(`User ${userId} accepted invitation to team ${invitation.teamId}`);

    return {
      status: 'success',
      message: 'Invitation accepted successfully',
      data: savedMember,
    };
  }

  // ──────────────────────────────────────────────
  //  Revoke invitation
  // ──────────────────────────────────────────────

  async revokeInvitation(
    teamId: string,
    invitationId: string,
    userId: string,
  ): Promise<ApiResponse<null>> {
    const requester = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!requester || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(requester.role)) {
      throw new ForbiddenException('Only owners and admins can revoke invitations');
    }

    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, teamId, status: InvitationStatus.PENDING },
    });
    if (!invitation) {
      throw new NotFoundException('Pending invitation not found');
    }

    invitation.status = InvitationStatus.REVOKED;
    await this.invitationRepository.save(invitation);

    return {
      status: 'success',
      message: 'Invitation revoked successfully',
    };
  }

  // ──────────────────────────────────────────────
  //  Get pending invitations
  // ──────────────────────────────────────────────

  async getPendingInvitations(
    teamId: string,
    userId: string,
  ): Promise<ApiResponse<TeamInvitation[]>> {
    const requester = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!requester || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(requester.role)) {
      throw new ForbiddenException('Only owners and admins can view invitations');
    }

    const invitations = await this.invitationRepository.find({
      where: { teamId, status: InvitationStatus.PENDING },
      order: { sentAt: 'DESC' },
    });

    return {
      status: 'success',
      message: 'Invitations retrieved successfully',
      data: invitations,
    };
  }

  // ──────────────────────────────────────────────
  //  Remove member
  // ──────────────────────────────────────────────

  async removeMember(
    teamId: string,
    memberId: string,
    userId: string,
  ): Promise<ApiResponse<null>> {
    const requester = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!requester || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(requester.role)) {
      throw new ForbiddenException('Only owners and admins can remove members');
    }

    const target = await this.memberRepository.findOne({ where: { id: memberId, teamId } });
    if (!target) {
      throw new NotFoundException('Member not found');
    }

    if (target.role === TeamMemberRole.OWNER) {
      throw new BadRequestException('Cannot remove the team owner');
    }

    await this.memberRepository.remove(target);

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}`,
      `${CACHE_TAG}:user:${target.userId}`,
      `${CACHE_TAG}:${teamId}:stats`,
    ]);

    return {
      status: 'success',
      message: 'Member removed successfully',
    };
  }

  // ──────────────────────────────────────────────
  //  Update member role
  // ──────────────────────────────────────────────

  async updateMemberRole(
    teamId: string,
    memberId: string,
    userId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<ApiResponse<TeamMember>> {
    const requester = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!requester || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(requester.role)) {
      throw new ForbiddenException('Only owners and admins can change member roles');
    }

    const target = await this.memberRepository.findOne({ where: { id: memberId, teamId } });
    if (!target) {
      throw new NotFoundException('Member not found');
    }

    if (target.role === TeamMemberRole.OWNER && dto.role !== TeamMemberRole.OWNER) {
      throw new BadRequestException('Cannot change the owner role. Transfer ownership first.');
    }

    // Only owner can promote to admin
    if (dto.role === TeamMemberRole.ADMIN && requester.role !== TeamMemberRole.OWNER) {
      throw new ForbiddenException('Only the owner can promote members to admin');
    }

    target.role = dto.role;
    target.permissions = dto.permissions || DEFAULT_PERMISSIONS[dto.role];
    const updated = await this.memberRepository.save(target);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}`]);

    return {
      status: 'success',
      message: 'Member role updated successfully',
      data: updated,
    };
  }

  // ──────────────────────────────────────────────
  //  Update member spend limit
  // ──────────────────────────────────────────────

  async updateMemberSpendLimit(
    teamId: string,
    memberId: string,
    userId: string,
    dto: UpdateMemberSpendLimitDto,
  ): Promise<ApiResponse<TeamMember>> {
    const requester = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!requester || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(requester.role)) {
      throw new ForbiddenException('Only owners and admins can set spend limits');
    }

    const target = await this.memberRepository.findOne({ where: { id: memberId, teamId } });
    if (!target) {
      throw new NotFoundException('Member not found');
    }

    target.spendLimit = dto.spendLimit;
    const updated = await this.memberRepository.save(target);

    return {
      status: 'success',
      message: 'Spend limit updated successfully',
      data: updated,
    };
  }

  // ──────────────────────────────────────────────
  //  Check domain auto-join
  // ──────────────────────────────────────────────

  async checkDomainAutoJoin(email: string): Promise<Team[]> {
    const domain = email.split('@')[1];
    if (!domain) return [];

    const teams = await this.teamRepository
      .createQueryBuilder('team')
      .where('team.is_active = :active', { active: true })
      .andWhere('team.domain_verified = :verified', { verified: true })
      .andWhere(`team.verified_domains @> :domains`, {
        domains: JSON.stringify([domain]),
      })
      .getMany();

    return teams;
  }
}
