import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TeamMemberRole, TeamMemberPermissions } from '../entities/team-member.entity';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: TeamMemberRole, example: TeamMemberRole.ADMIN })
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;

  @ApiPropertyOptional({
    example: {
      canPurchase: true,
      canDownload: true,
      canManageMembers: true,
      canViewAnalytics: true,
      canApproveRequests: false,
    },
  })
  @IsOptional()
  permissions?: TeamMemberPermissions;
}
