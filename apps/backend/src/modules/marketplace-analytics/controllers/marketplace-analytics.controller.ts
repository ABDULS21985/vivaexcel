import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ReportingService } from '../services/reporting.service';
import { AnalyticsAggregationService } from '../services/analytics-aggregation.service';
import { MarketplaceAnalyticsRepository } from '../marketplace-analytics.repository';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { ExportQueryDto } from '../dto/export-query.dto';
import { TrackViewDto } from '../dto/track-view.dto';
import { TrackConversionDto } from '../dto/track-conversion.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import {
  AnalyticsPeriod,
  AnalyticsScope,
  ReportGroupBy,
} from '../enums/analytics.enums';

@ApiTags('Marketplace Analytics')
@Controller('marketplace-analytics')
@UseGuards(RolesGuard, PermissionsGuard)
export class MarketplaceAnalyticsController {
  constructor(
    private readonly reportingService: ReportingService,
    private readonly aggregationService: AnalyticsAggregationService,
    private readonly repository: MarketplaceAnalyticsRepository,
  ) {}

  // ──────────────────────────────────────────────
  //  Platform Analytics (Admin only)
  // ──────────────────────────────────────────────

  @Get('platform/overview')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform analytics overview with sparklines and period comparison' })
  @SwaggerResponse({ status: 200, description: 'Platform overview retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  async getPlatformOverview(@Query() query: AnalyticsQueryDto) {
    return this.reportingService.getPlatformOverview(
      query.period || AnalyticsPeriod.THIRTY_DAYS,
    );
  }

  @Get('platform/revenue')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform revenue report with time series breakdown' })
  @SwaggerResponse({ status: 200, description: 'Revenue report generated successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ReportGroupBy, description: 'Group results by interval' })
  async getPlatformRevenue(@Query() query: AnalyticsQueryDto) {
    const dateRange = this.buildDateRange(query);
    return this.reportingService.generateRevenueReport(
      dateRange,
      query.groupBy || ReportGroupBy.DAY,
    );
  }

  @Get('platform/top-products')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get top-performing products by views, revenue, and conversion' })
  @SwaggerResponse({ status: 200, description: 'Top products retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top products to return' })
  async getTopProducts(@Query() query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.resolveDates(query);
    const products = await this.repository.getTopProducts(
      startDate,
      endDate,
      query.limit || 10,
      'revenue',
    );

    return {
      status: 'success',
      message: 'Top products retrieved successfully',
      data: products,
    };
  }

  @Get('platform/funnel')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get conversion funnel analysis with stage-by-stage drop-off rates' })
  @SwaggerResponse({ status: 200, description: 'Conversion funnel retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  async getConversionFunnel(@Query() query: AnalyticsQueryDto) {
    return this.reportingService.getConversionFunnel(
      query.period || AnalyticsPeriod.THIRTY_DAYS,
    );
  }

  // ──────────────────────────────────────────────
  //  Seller Analytics (Authenticated)
  // ──────────────────────────────────────────────

  @Get('seller/:id/overview')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller analytics overview including revenue and order trends' })
  @ApiParam({ name: 'id', description: 'Seller user ID' })
  @SwaggerResponse({ status: 200, description: 'Seller report generated successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  async getSellerOverview(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const dateRange = this.buildDateRange(query);
    return this.reportingService.generateSellerReport(id, dateRange);
  }

  @Get('seller/:id/revenue')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller revenue report with time series breakdown' })
  @ApiParam({ name: 'id', description: 'Seller user ID' })
  @SwaggerResponse({ status: 200, description: 'Seller revenue report generated successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ReportGroupBy, description: 'Group results by interval' })
  async getSellerRevenue(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const dateRange = this.buildDateRange(query);
    return this.reportingService.generateRevenueReport(
      dateRange,
      query.groupBy || ReportGroupBy.DAY,
      AnalyticsScope.SELLER,
      id,
    );
  }

  // ──────────────────────────────────────────────
  //  Product Analytics (Authenticated)
  // ──────────────────────────────────────────────

  @Get('product/:id/overview')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product performance report including views, conversions, and revenue' })
  @ApiParam({ name: 'id', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Product performance report generated successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  async getProductOverview(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const dateRange = this.buildDateRange(query);
    return this.reportingService.generateProductPerformanceReport(id, dateRange);
  }

  @Get('product/:id/traffic')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get traffic source breakdown for a product' })
  @ApiParam({ name: 'id', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Traffic source breakdown retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: AnalyticsPeriod, description: 'Analytics period' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Custom range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Custom range end date (ISO 8601)' })
  async getProductTraffic(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const { startDate, endDate } = this.resolveDates(query);
    const trafficSources = await this.repository.getTrafficSourceBreakdown(
      startDate,
      endDate,
      id,
    );

    return {
      status: 'success',
      message: 'Traffic source breakdown retrieved successfully',
      data: trafficSources,
    };
  }

  // ──────────────────────────────────────────────
  //  Event Tracking
  // ──────────────────────────────────────────────

  @Post('events/view')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a product view event' })
  @SwaggerResponse({ status: 201, description: 'View event tracked successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  async trackView(@Body() dto: TrackViewDto) {
    const [view] = await Promise.all([
      this.repository.trackView(dto),
      this.aggregationService.incrementProductViewCount(dto.digitalProductId),
      this.aggregationService.trackActiveViewer(
        dto.digitalProductId,
        dto.sessionId,
      ),
    ]);

    return {
      status: 'success',
      message: 'View event tracked successfully',
      data: { id: view.id },
    };
  }

  @Post('events/conversion')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a conversion event (add to cart, checkout, purchase, etc.)' })
  @SwaggerResponse({ status: 201, description: 'Conversion event tracked successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  async trackConversion(
    @CurrentUser('sub') userId: string,
    @Body() dto: TrackConversionDto,
  ) {
    const event = await this.repository.trackConversion({
      ...dto,
      userId,
    });

    return {
      status: 'success',
      message: 'Conversion event tracked successfully',
      data: { id: event.id },
    };
  }

  // ──────────────────────────────────────────────
  //  Export
  // ──────────────────────────────────────────────

  @Get('export/revenue')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Export revenue report as CSV' })
  @SwaggerResponse({ status: 200, description: 'Revenue report exported successfully' })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'json'], description: 'Export format' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Export range start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Export range end date (ISO 8601)' })
  async exportRevenue(
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const dateRange = {
      startDate: query.startDate,
      endDate: query.endDate,
    };

    const report = await this.reportingService.generateRevenueReport(
      dateRange,
      ReportGroupBy.DAY,
      query.scope,
      query.scopeId,
    );

    const revenueData = report.data;

    if (!revenueData) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=revenue-report.csv',
      );
      res.send('');
      return;
    }

    const csv = this.reportingService.exportToCsv(
      revenueData.timeSeries,
      [
        { key: 'period', label: 'Period' },
        { key: 'grossRevenue', label: 'Gross Revenue' },
        { key: 'netRevenue', label: 'Net Revenue' },
        { key: 'platformFees', label: 'Platform Fees' },
        { key: 'orderCount', label: 'Orders' },
      ],
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=revenue-report.csv',
    );
    res.send(csv);
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  /**
   * Build a DateRange object from AnalyticsQueryDto.
   * Falls back to deriving dates from the period enum.
   */
  private buildDateRange(query: AnalyticsQueryDto): {
    startDate: string;
    endDate: string;
  } {
    if (query.startDate && query.endDate) {
      return {
        startDate: query.startDate,
        endDate: query.endDate,
      };
    }

    const { startDate, endDate } = this.resolveDates(query);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  /**
   * Resolve concrete Date objects from the query DTO.
   */
  private resolveDates(query: AnalyticsQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    if (query.startDate && query.endDate) {
      return {
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
      };
    }

    const endDate = new Date();
    const startDate = new Date();

    switch (query.period) {
      case AnalyticsPeriod.SEVEN_DAYS:
        startDate.setUTCDate(startDate.getUTCDate() - 7);
        break;
      case AnalyticsPeriod.NINETY_DAYS:
        startDate.setUTCDate(startDate.getUTCDate() - 90);
        break;
      case AnalyticsPeriod.ONE_YEAR:
        startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
        break;
      case AnalyticsPeriod.THIRTY_DAYS:
      default:
        startDate.setUTCDate(startDate.getUTCDate() - 30);
        break;
    }

    return { startDate, endDate };
  }
}
