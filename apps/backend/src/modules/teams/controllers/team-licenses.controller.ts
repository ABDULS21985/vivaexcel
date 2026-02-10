import {
  Controller,
  Get,
  Post,
  Param,
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
import { TeamLicensesService } from '../services/team-licenses.service';

@ApiTags('Team Licenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/licenses')
export class TeamLicensesController {
  constructor(private readonly licensesService: TeamLicensesService) {}

  @ApiOperation({ summary: 'Get team licenses' })
  @ApiResponse({ status: 200, description: 'License list' })
  @Get()
  async getTeamLicenses(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
  ) {
    return this.licensesService.getTeamLicenses(teamId, userId);
  }

  @ApiOperation({ summary: 'Activate a seat on a team license' })
  @ApiResponse({ status: 200, description: 'Seat activated' })
  @Post(':licenseId/activate')
  async activateSeat(
    @Param('teamId') teamId: string,
    @Param('licenseId') licenseId: string,
    @UserId() userId: string,
  ) {
    return this.licensesService.activateSeat(teamId, licenseId, userId);
  }

  @ApiOperation({ summary: 'Deactivate a seat on a team license' })
  @ApiResponse({ status: 200, description: 'Seat deactivated' })
  @Post(':licenseId/deactivate')
  async deactivateSeat(
    @Param('teamId') teamId: string,
    @Param('licenseId') licenseId: string,
    @UserId() userId: string,
  ) {
    return this.licensesService.deactivateSeat(teamId, licenseId, userId);
  }
}
