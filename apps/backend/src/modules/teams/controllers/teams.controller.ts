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
import { TeamsService } from '../services/teams.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { UpdateTeamSettingsDto } from '../dto/update-team-settings.dto';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created' })
  @Post()
  async create(
    @UserId() userId: string,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teamsService.createTeam(userId, dto);
  }

  @ApiOperation({ summary: 'Get my teams' })
  @ApiResponse({ status: 200, description: 'List of teams' })
  @Get()
  async getMyTeams(@UserId() userId: string) {
    return this.teamsService.getMyTeams(userId);
  }

  @ApiOperation({ summary: 'Get team details' })
  @ApiResponse({ status: 200, description: 'Team details' })
  @Get(':teamId')
  async getTeam(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
  ) {
    return this.teamsService.getTeam(teamId, userId);
  }

  @ApiOperation({ summary: 'Get team statistics' })
  @ApiResponse({ status: 200, description: 'Team stats' })
  @Get(':teamId/stats')
  async getTeamStats(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
  ) {
    return this.teamsService.getTeamStats(teamId, userId);
  }

  @ApiOperation({ summary: 'Update team details' })
  @ApiResponse({ status: 200, description: 'Team updated' })
  @Patch(':teamId')
  async updateTeam(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.updateTeam(teamId, userId, dto);
  }

  @ApiOperation({ summary: 'Update team settings (SSO, domains, etc.)' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  @Patch(':teamId/settings')
  async updateSettings(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
    @Body() dto: UpdateTeamSettingsDto,
  ) {
    return this.teamsService.updateTeamSettings(teamId, userId, dto);
  }

  @ApiOperation({ summary: 'Delete team (owner only)' })
  @ApiResponse({ status: 200, description: 'Team deleted' })
  @Delete(':teamId')
  async deleteTeam(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
  ) {
    return this.teamsService.deleteTeam(teamId, userId);
  }
}
