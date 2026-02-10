import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamPlan } from '../entities/team.entity';
import { TeamMember, TeamMemberRole, DEFAULT_PERMISSIONS } from '../entities/team-member.entity';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { UpdateTeamSettingsDto } from '../dto/update-team-settings.dto';
import { CacheService } from '../../../common/cache/cache.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_TAG = 'teams';
const MAX_MEMBERS_BY_PLAN: Record<TeamPlan, number> = {
  [TeamPlan.TEAM_STARTER]: 5,
  [TeamPlan.TEAM_PROFESSIONAL]: 25,
  [TeamPlan.TEAM_ENTERPRISE]: 250,
};

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Create team
  // ──────────────────────────────────────────────

  async createTeam(
    userId: string,
    dto: CreateTeamDto,
  ): Promise<ApiResponse<Team>> {
    this.logger.log(`Creating team: ${dto.name} for user ${userId}`);

    const existing = await this.teamRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException(`Team slug already exists: ${dto.slug}`);
    }

    const plan = dto.plan || TeamPlan.TEAM_STARTER;
    const team = this.teamRepository.create({
      ...dto,
      plan,
      maxMembers: MAX_MEMBERS_BY_PLAN[plan],
      ownerId: userId,
    });

    const savedTeam = await this.teamRepository.save(team);

    // Add creator as owner
    const ownerMember = this.memberRepository.create({
      teamId: savedTeam.id,
      userId,
      role: TeamMemberRole.OWNER,
      permissions: DEFAULT_PERMISSIONS[TeamMemberRole.OWNER],
      joinedAt: new Date(),
    });
    await this.memberRepository.save(ownerMember);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:user:${userId}`]);

    this.logger.log(`Team created: ${savedTeam.id}`);

    return {
      status: 'success',
      message: 'Team created successfully',
      data: savedTeam,
    };
  }

  // ──────────────────────────────────────────────
  //  Get team by ID
  // ──────────────────────────────────────────────

  async getTeam(teamId: string, userId: string): Promise<ApiResponse<Team>> {
    const cacheKey = this.cacheService.generateKey(CACHE_TAG, teamId);

    const team = await this.cacheService.wrap(
      cacheKey,
      () =>
        this.teamRepository.findOne({
          where: { id: teamId, isActive: true },
          relations: ['owner'],
        }),
      { ttl: 600, tags: [`${CACHE_TAG}:${teamId}`] },
    );

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Verify membership
    const member = await this.memberRepository.findOne({
      where: { teamId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return {
      status: 'success',
      message: 'Team retrieved successfully',
      data: team,
    };
  }

  // ──────────────────────────────────────────────
  //  Get my teams
  // ──────────────────────────────────────────────

  async getMyTeams(userId: string): Promise<ApiResponse<Team[]>> {
    const cacheKey = this.cacheService.generateKey(CACHE_TAG, 'user', userId);

    const teams = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const memberships = await this.memberRepository.find({
          where: { userId },
          relations: ['team'],
        });
        return memberships
          .map((m) => m.team)
          .filter((t) => t && t.isActive);
      },
      { ttl: 300, tags: [`${CACHE_TAG}:user:${userId}`] },
    );

    return {
      status: 'success',
      message: 'Teams retrieved successfully',
      data: teams,
    };
  }

  // ──────────────────────────────────────────────
  //  Update team
  // ──────────────────────────────────────────────

  async updateTeam(
    teamId: string,
    userId: string,
    dto: UpdateTeamDto,
  ): Promise<ApiResponse<Team>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(member.role)) {
      throw new ForbiddenException('Only owners and admins can update team settings');
    }

    // Update max members if plan changed
    if (dto.plan && dto.plan !== team.plan) {
      dto.maxMembers = dto.maxMembers || MAX_MEMBERS_BY_PLAN[dto.plan];
    }

    Object.assign(team, dto);
    const updated = await this.teamRepository.save(team);

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}`,
      `${CACHE_TAG}:user:${userId}`,
    ]);

    return {
      status: 'success',
      message: 'Team updated successfully',
      data: updated,
    };
  }

  // ──────────────────────────────────────────────
  //  Update team settings (SSO, domains, etc.)
  // ──────────────────────────────────────────────

  async updateTeamSettings(
    teamId: string,
    userId: string,
    dto: UpdateTeamSettingsDto,
  ): Promise<ApiResponse<Team>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(member.role)) {
      throw new ForbiddenException('Only owners and admins can update team settings');
    }

    // SSO is enterprise-only
    if (dto.ssoEnabled && team.plan !== TeamPlan.TEAM_ENTERPRISE) {
      throw new BadRequestException('SSO is only available on the Enterprise plan');
    }

    if (dto.ssoEnabled !== undefined) team.ssoEnabled = dto.ssoEnabled;
    if (dto.ssoProvider !== undefined) team.ssoProvider = dto.ssoProvider;
    if (dto.ssoConfig !== undefined) team.ssoConfig = dto.ssoConfig;
    if (dto.purchaseApprovalRequired !== undefined) team.purchaseApprovalRequired = dto.purchaseApprovalRequired;
    if (dto.monthlyBudget !== undefined) team.monthlyBudget = dto.monthlyBudget;
    if (dto.verifiedDomains !== undefined) team.verifiedDomains = dto.verifiedDomains;
    if (dto.sharedLibraryEnabled !== undefined) team.sharedLibraryEnabled = dto.sharedLibraryEnabled;

    const updated = await this.teamRepository.save(team);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}`]);

    return {
      status: 'success',
      message: 'Team settings updated successfully',
      data: updated,
    };
  }

  // ──────────────────────────────────────────────
  //  Delete team (soft delete)
  // ──────────────────────────────────────────────

  async deleteTeam(teamId: string, userId: string): Promise<ApiResponse<null>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Only the team owner can delete the team');
    }

    team.isActive = false;
    await this.teamRepository.save(team);
    await this.teamRepository.softDelete(teamId);

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}`,
      `${CACHE_TAG}:user:${userId}`,
    ]);

    return {
      status: 'success',
      message: 'Team deleted successfully',
    };
  }

  // ──────────────────────────────────────────────
  //  Get team stats
  // ──────────────────────────────────────────────

  async getTeamStats(
    teamId: string,
    userId: string,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const cacheKey = this.cacheService.generateKey(CACHE_TAG, teamId, 'stats');

    const stats = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const team = await this.teamRepository.findOne({ where: { id: teamId } });
        const memberCount = await this.memberRepository.count({ where: { teamId } });

        return {
          memberCount,
          maxMembers: team?.maxMembers || 0,
          plan: team?.plan,
          monthlyBudget: team?.monthlyBudget,
          currentMonthSpend: team?.currentMonthSpend || 0,
          remainingBudget: team?.monthlyBudget
            ? Number(team.monthlyBudget) - Number(team.currentMonthSpend || 0)
            : null,
          sharedLibraryEnabled: team?.sharedLibraryEnabled,
          purchaseApprovalRequired: team?.purchaseApprovalRequired,
        };
      },
      { ttl: 120, tags: [`${CACHE_TAG}:${teamId}:stats`] },
    );

    return {
      status: 'success',
      message: 'Team stats retrieved successfully',
      data: stats,
    };
  }
}
