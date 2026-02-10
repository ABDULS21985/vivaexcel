import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeploymentVerificationService } from '../services/deployment-verification.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';

@ApiTags('Monitoring - Deployment')
@ApiBearerAuth('JWT-auth')
@Controller('monitoring/deploy')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class DeploymentController {
  constructor(
    private readonly deployService: DeploymentVerificationService,
  ) {}

  @Post('verify')
  @ApiOperation({ summary: 'Manually trigger smoke tests' })
  async verify() {
    const results = await this.deployService.runSmokeTests();
    return { status: 'success', data: results };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get recent deployment smoke test results' })
  async getHistory() {
    const history = await this.deployService.getDeployHistory();
    return { status: 'success', data: history };
  }
}
