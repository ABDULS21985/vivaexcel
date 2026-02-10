import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserId } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { TeamMembersService } from '../services/team-members.service';
import { InviteMembersDto } from '../dto/invite-members.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';
import { UpdateMemberSpendLimitDto } from '../dto/update-member-spend-limit.dto';

@ApiTags('Team Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/members')
export class TeamMembersController {
  constructor(private readonly membersService: TeamMembersService) {}

  @ApiOperation({ summary: 'Get team members' })
  @ApiResponse({ status: 200, description: 'Member list' })
  @Get()
  async getMembers(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
  ) {
    return this.membersService.getMembers(teamId, userId);
  }

  @ApiOperation({ summary: 'Invite members to team' })
  @ApiResponse({ status: 201, description: 'Invitations sent' })
  @Post('invite')
  async inviteMembers(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
    @Body() dto: InviteMembersDto,
  ) {
    return this.membersService.inviteMembers(teamId, userId, dto);
  }

  @ApiOperation({ summary: 'Accept team invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @Post('accept-invitation/:token')
  async acceptInvitation(
    @Param('token') token: string,
    @UserId() userId: string,
  ) {
    return this.membersService.acceptInvitation(token, userId);
  }

  @ApiOperation({ summary: 'Get pending invitations' })
  @ApiResponse({ status: 200, description: 'Pending invitations' })
  @Get('invitations')
  async getPendingInvitations(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
  ) {
    return this.membersService.getPendingInvitations(teamId, userId);
  }

  @ApiOperation({ summary: 'Revoke an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked' })
  @Delete('invitations/:invitationId')
  async revokeInvitation(
    @Param('teamId') teamId: string,
    @Param('invitationId') invitationId: string,
    @UserId() userId: string,
  ) {
    return this.membersService.revokeInvitation(teamId, invitationId, userId);
  }

  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @Patch(':memberId/role')
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @UserId() userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateMemberRole(teamId, memberId, userId, dto);
  }

  @ApiOperation({ summary: 'Update member spend limit' })
  @ApiResponse({ status: 200, description: 'Spend limit updated' })
  @Patch(':memberId/spend-limit')
  async updateMemberSpendLimit(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @UserId() userId: string,
    @Body() dto: UpdateMemberSpendLimitDto,
  ) {
    return this.membersService.updateMemberSpendLimit(teamId, memberId, userId, dto);
  }

  @ApiOperation({ summary: 'Remove member from team' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @Delete(':memberId')
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @UserId() userId: string,
  ) {
    return this.membersService.removeMember(teamId, memberId, userId);
  }
}
