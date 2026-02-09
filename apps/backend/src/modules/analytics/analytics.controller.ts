import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-pageview.dto';
import { AnalyticsPeriodDto } from './dto/analytics-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(RolesGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('pageview')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a page view' })
  @SwaggerResponse({
    status: 201,
    description: 'Page view tracked successfully',
  })
  async trackPageView(
    @Body() dto: TrackPageViewDto,
    @Req() req: Request,
    @CurrentUser('sub') userId?: string,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;

    return this.analyticsService.trackPageView(
      dto,
      userId ?? undefined,
      userAgent,
      ip,
    );
  }

  @Get('dashboard')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get analytics dashboard overview' })
  @SwaggerResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Get('posts/:id/stats')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get stats for a specific post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Post stats retrieved successfully',
  })
  async getPostStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.analyticsService.getPostStats(id);
  }

  @Get('top-posts')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get top performing posts' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['7d', '30d', '90d'],
    description: 'Time period',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Top posts retrieved successfully',
  })
  async getTopPosts(@Query() query: AnalyticsPeriodDto) {
    return this.analyticsService.getTopPosts(query.period);
  }

  @Get('traffic-sources')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get traffic source breakdown' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['7d', '30d', '90d'],
    description: 'Time period',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Traffic sources retrieved successfully',
  })
  async getTrafficSources(@Query() query: AnalyticsPeriodDto) {
    return this.analyticsService.getTrafficSources(query.period);
  }
}
