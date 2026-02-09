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
import { SellerApplicationsService } from '../services/seller-applications.service';
import { CreateSellerApplicationDto } from '../dto/create-seller-application.dto';
import { ReviewSellerApplicationDto } from '../dto/review-seller-application.dto';
import { ApplicationQueryDto } from '../dto/application-query.dto';

@ApiTags('Seller Applications')
@Controller('seller-applications')
export class SellerApplicationsController {
  constructor(
    private readonly applicationsService: SellerApplicationsService,
  ) {}

  // ─── User Endpoints ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Submit a seller application' })
  async submit(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: CreateSellerApplicationDto,
  ) {
    const application = await this.applicationsService.submitApplication(user.sub, dto);
    return { status: 'success', message: 'Application submitted successfully', data: application };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-application')
  @ApiOperation({ summary: 'Get my latest application' })
  async getMyApplication(@CurrentUser() user: JwtUserPayload) {
    const application = await this.applicationsService.getMyApplication(user.sub);
    return { status: 'success', message: 'Application retrieved', data: application };
  }

  // ─── Admin Endpoints ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all applications (admin)' })
  async findAll(@Query() query: ApplicationQueryDto) {
    const result = await this.applicationsService.findAll(query);
    return { status: 'success', message: 'Applications retrieved', data: result.items, meta: result.meta };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID (admin)' })
  async findById(@Param('id') id: string) {
    const application = await this.applicationsService.findById(id);
    return { status: 'success', message: 'Application retrieved', data: application };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id/review')
  @ApiOperation({ summary: 'Review a seller application (admin)' })
  async review(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: ReviewSellerApplicationDto,
  ) {
    const application = await this.applicationsService.reviewApplication(id, user.sub, dto);
    return { status: 'success', message: `Application ${dto.decision}d`, data: application };
  }
}
