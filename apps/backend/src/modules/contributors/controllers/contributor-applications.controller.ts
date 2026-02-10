import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, JwtUserPayload } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { ContributorApplicationsService } from '../services/contributor-applications.service';
import { CreateContributorApplicationDto } from '../dto/create-contributor-application.dto';
import { ReviewContributorApplicationDto } from '../dto/review-contributor-application.dto';
import { ContributorApplicationQueryDto } from '../dto/contributor-application-query.dto';

@ApiTags('Contributor Applications')
@Controller('contributor-applications')
export class ContributorApplicationsController {
  constructor(
    private readonly applicationsService: ContributorApplicationsService,
  ) {}

  // ─── User Endpoints ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Submit a contributor application' })
  async submit(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: CreateContributorApplicationDto,
  ) {
    const application = await this.applicationsService.submitApplication(user.sub, dto);
    return { status: 'success', message: 'Application submitted successfully', data: application };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-application')
  @ApiOperation({ summary: 'Get my latest contributor application' })
  async getMyApplication(@CurrentUser() user: JwtUserPayload) {
    const application = await this.applicationsService.getMyApplication(user.sub);
    return { status: 'success', message: 'Application retrieved', data: application };
  }

  // ─── Admin Endpoints ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all contributor applications (admin)' })
  async findAll(@Query() query: ContributorApplicationQueryDto) {
    const result = await this.applicationsService.findAll(query);
    return { status: 'success', message: 'Applications retrieved', data: result.items, meta: result.meta };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get contributor application by ID (admin)' })
  async findById(@Param('id') id: string) {
    const application = await this.applicationsService.findById(id);
    return { status: 'success', message: 'Application retrieved', data: application };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/review')
  @ApiOperation({ summary: 'Review a contributor application (admin)' })
  async review(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: ReviewContributorApplicationDto,
  ) {
    const application = await this.applicationsService.reviewApplication(id, user.sub, dto);
    return { status: 'success', message: `Application ${dto.decision}d`, data: application };
  }
}
