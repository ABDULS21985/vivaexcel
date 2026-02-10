import { SetMetadata } from '@nestjs/common';
import { TeamMemberRole } from '../entities/team-member.entity';

export const TEAM_ROLES_KEY = 'teamRoles';

export const TeamRoles = (...roles: TeamMemberRole[]) =>
  SetMetadata(TEAM_ROLES_KEY, roles);
