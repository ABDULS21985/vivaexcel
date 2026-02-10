import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Team, TeamPlan } from '../entities/team.entity';
import { TeamMember, TeamMemberRole, DEFAULT_PERMISSIONS } from '../entities/team-member.entity';
import { CacheService } from '../../../common/cache/cache.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_TAG = 'teams';

export interface SamlConfig {
  entryPoint: string;
  issuer: string;
  cert: string;
  callbackUrl?: string;
  attributeMapping?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    groups?: string;
  };
  groupMapping?: Record<string, TeamMemberRole>;
}

export interface DomainVerification {
  domain: string;
  txtRecord: string;
  verified: boolean;
}

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Configure SAML
  // ──────────────────────────────────────────────

  async configureSaml(
    teamId: string,
    userId: string,
    config: SamlConfig,
  ): Promise<ApiResponse<Team>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.plan !== TeamPlan.TEAM_ENTERPRISE) {
      throw new BadRequestException('SSO is only available on the Enterprise plan');
    }

    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || member.role !== TeamMemberRole.OWNER) {
      throw new BadRequestException('Only the team owner can configure SSO');
    }

    team.ssoEnabled = true;
    team.ssoProvider = 'saml';
    team.ssoConfig = config as unknown as Record<string, unknown>;

    const saved = await this.teamRepository.save(team);
    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}`]);

    this.logger.log(`SAML configured for team ${teamId}`);

    return {
      status: 'success',
      message: 'SAML SSO configured successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Just-In-Time provisioning
  // ──────────────────────────────────────────────

  async jitProvision(
    teamId: string,
    samlProfile: {
      email: string;
      firstName?: string;
      lastName?: string;
      groups?: string[];
    },
    existingUserId: string,
  ): Promise<TeamMember> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team || !team.ssoEnabled) {
      throw new BadRequestException('SSO is not enabled for this team');
    }

    // Check if already a member
    const existing = await this.memberRepository.findOne({
      where: { teamId, userId: existingUserId },
    });
    if (existing) {
      // Update last active
      existing.lastActiveAt = new Date();
      return this.memberRepository.save(existing);
    }

    // Determine role from SAML groups
    let role = TeamMemberRole.MEMBER;
    const config = team.ssoConfig as unknown as SamlConfig;
    if (config?.groupMapping && samlProfile.groups) {
      for (const group of samlProfile.groups) {
        if (config.groupMapping[group]) {
          role = config.groupMapping[group];
          break;
        }
      }
    }

    const member = this.memberRepository.create({
      teamId,
      userId: existingUserId,
      role,
      permissions: DEFAULT_PERMISSIONS[role],
      joinedAt: new Date(),
    });

    const saved = await this.memberRepository.save(member);

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}`,
      `${CACHE_TAG}:${teamId}:stats`,
    ]);

    this.logger.log(`JIT provisioned user ${existingUserId} to team ${teamId} with role ${role}`);

    return saved;
  }

  // ──────────────────────────────────────────────
  //  Generate domain verification record
  // ──────────────────────────────────────────────

  async generateDomainVerification(
    teamId: string,
    userId: string,
    domain: string,
  ): Promise<ApiResponse<DomainVerification>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(member.role)) {
      throw new BadRequestException('Only owners and admins can verify domains');
    }

    const txtRecord = `vivaexcel-verify=${randomBytes(16).toString('hex')}`;

    return {
      status: 'success',
      message: 'Domain verification record generated',
      data: {
        domain,
        txtRecord,
        verified: false,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Verify domain (check DNS TXT record)
  // ──────────────────────────────────────────────

  async verifyDomain(
    teamId: string,
    userId: string,
    domain: string,
  ): Promise<ApiResponse<{ verified: boolean }>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(member.role)) {
      throw new BadRequestException('Only owners and admins can verify domains');
    }

    // In production, you would do actual DNS TXT record lookup here
    // For now, we'll add the domain to verifiedDomains
    const domains = team.verifiedDomains || [];
    if (!domains.includes(domain)) {
      domains.push(domain);
    }

    team.verifiedDomains = domains;
    team.domainVerified = true;
    await this.teamRepository.save(team);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}`]);

    this.logger.log(`Domain ${domain} verified for team ${teamId}`);

    return {
      status: 'success',
      message: 'Domain verified successfully',
      data: { verified: true },
    };
  }
}
