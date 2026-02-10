import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { WebVitalReport, WebVitalRating } from '../../../entities/web-vital-report.entity';
import { PerformanceBudget, WebVitalMetric } from '../../../entities/performance-budget.entity';

@ApiTags('Monitoring - Performance')
@Controller('monitoring/performance')
export class PerformanceController {
  constructor(
    @InjectRepository(WebVitalReport)
    private readonly webVitalRepo: Repository<WebVitalReport>,
    @InjectRepository(PerformanceBudget)
    private readonly budgetRepo: Repository<PerformanceBudget>,
  ) {}

  @Post('web-vitals')
  @Public()
  @ApiOperation({ summary: 'Submit Web Vitals report from frontend' })
  async reportWebVitals(
    @Body()
    body: {
      route: string;
      metrics: Array<{ name: string; value: number; rating: string }>;
      userAgent?: string;
      country?: string;
      connectionType?: string;
    },
  ) {
    const reports: WebVitalReport[] = [];

    for (const metric of body.metrics) {
      const metricName = metric.name.toUpperCase() as WebVitalMetric;
      if (!Object.values(WebVitalMetric).includes(metricName)) continue;

      const report = this.webVitalRepo.create({
        route: body.route,
        metricName,
        value: metric.value,
        rating: metric.rating.toUpperCase().replace(/-/g, '_') as WebVitalRating,
        userAgent: body.userAgent?.substring(0, 255) || null,
        country: body.country?.substring(0, 2) || null,
        connectionType: body.connectionType || null,
      });
      reports.push(report);
    }

    if (reports.length > 0) {
      await this.webVitalRepo.save(reports);

      // Update performance budgets
      for (const report of reports) {
        await this.updateBudget(report.route, report.metricName);
      }
    }

    return { status: 'success', message: 'Web vitals recorded' };
  }

  @Get('budgets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all performance budgets' })
  async getBudgets() {
    const budgets = await this.budgetRepo.find({
      order: { route: 'ASC', metricName: 'ASC' },
    });
    return { status: 'success', data: budgets };
  }

  @Post('budgets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create or update a performance budget' })
  async upsertBudget(
    @Body()
    body: {
      route: string;
      metricName: WebVitalMetric;
      budgetValue: number;
    },
  ) {
    let budget = await this.budgetRepo.findOne({
      where: { route: body.route, metricName: body.metricName },
    });

    if (budget) {
      budget.budgetValue = body.budgetValue;
      budget = await this.budgetRepo.save(budget);
    } else {
      budget = await this.budgetRepo.save(
        this.budgetRepo.create({
          route: body.route,
          metricName: body.metricName,
          budgetValue: body.budgetValue,
        }),
      );
    }

    return { status: 'success', message: 'Budget saved', data: budget };
  }

  @Get('vitals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Query Web Vitals aggregated by route and metric' })
  @ApiQuery({ name: 'route', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getVitals(
    @Query('route') route?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const qb = this.webVitalRepo
      .createQueryBuilder('wvr')
      .select('wvr.route', 'route')
      .addSelect('wvr.metric_name', 'metricName')
      .addSelect('COUNT(*)', 'sampleCount')
      .addSelect(
        'PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY wvr.value)',
        'p75',
      )
      .addSelect(
        'PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY wvr.value)',
        'p99',
      )
      .groupBy('wvr.route')
      .addGroupBy('wvr.metric_name');

    if (route) {
      qb.where('wvr.route = :route', { route });
    }

    if (from && to) {
      qb.andWhere('wvr.created_at BETWEEN :from AND :to', {
        from: new Date(from),
        to: new Date(to),
      });
    } else if (from) {
      qb.andWhere('wvr.created_at >= :from', { from: new Date(from) });
    }

    const results = await qb.getRawMany();

    return { status: 'success', data: results };
  }

  private async updateBudget(
    route: string,
    metricName: WebVitalMetric,
  ): Promise<void> {
    try {
      const budget = await this.budgetRepo.findOne({
        where: { route, metricName },
      });
      if (!budget) return;

      // Get current p75 and p99 from recent reports
      const stats = await this.webVitalRepo
        .createQueryBuilder('wvr')
        .select(
          'PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY wvr.value)',
          'p75',
        )
        .addSelect(
          'PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY wvr.value)',
          'p99',
        )
        .addSelect('COUNT(*)', 'count')
        .where('wvr.route = :route', { route })
        .andWhere('wvr.metric_name = :metricName', { metricName })
        .getRawOne();

      if (stats) {
        budget.currentP75 = parseFloat(stats.p75) || null;
        budget.currentP99 = parseFloat(stats.p99) || null;
        budget.sampleCount = parseInt(stats.count, 10) || 0;
        budget.lastReportedAt = new Date();
        budget.isCompliant =
          budget.currentP75 !== null &&
          budget.currentP75 <= Number(budget.budgetValue);

        await this.budgetRepo.save(budget);
      }
    } catch {
      // Non-critical update
    }
  }
}
