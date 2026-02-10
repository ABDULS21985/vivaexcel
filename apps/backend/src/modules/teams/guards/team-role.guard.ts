import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember, TeamMemberRole } from '../entities/team-member.entity';
import { TEAM_ROLES_KEY } from '../decorators/team-roles.decorator';
import { RequestWithUser } from '../../../common/decorators/current-user.decorator';

const ROLE_HIERARCHY: Record<TeamMemberRole, number> = {
  [TeamMemberRole.OWNER]: 5,
  [TeamMemberRole.ADMIN]: 4,
  [TeamMemberRole.MANAGER]: 3,
  [TeamMemberRole.MEMBER]: 2,
  [TeamMemberRole.VIEWER]: 1,
};

@Injectable()
export class TeamRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<TeamMemberRole[]>(
      TEAM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.sub;
    const teamId = request.params?.teamId;

    if (!userId || !teamId) {
      throw new ForbiddenException('Missing user or team context');
    }

    // Check if member info is already attached (from TeamMembershipGuard)
    let member = (request as any).teamMember as TeamMember | undefined;
    if (!member) {
      member = await this.memberRepository.findOne({
        where: { teamId, userId },
      });
    }

    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check if member has one of the required roles (or higher in hierarchy)
    const memberLevel = ROLE_HIERARCHY[member.role] || 0;
    const hasAccess = requiredRoles.some(
      (role) => memberLevel >= (ROLE_HIERARCHY[role] || 0),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Insufficient team role. Required: ${requiredRoles.join(' or ')}, Current: ${member.role}`,
      );
    }

    return true;
  }
}
