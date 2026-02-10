import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueRecord } from '../../../entities/revenue-record.entity';
import { MarketBenchmark } from '../../../entities/market-benchmark.entity';
import { SellerProfile } from '../../../entities/seller-profile.entity';
import { SalesForecast } from '../dto/seller-growth.dto';

@Injectable()
export class SalesForecastingService {
  private readonly logger = new Logger(SalesForecastingService.name);

  constructor(
    @InjectRepository(RevenueRecord)
    private readonly revenueRecordRepo: Repository<RevenueRecord>,
    @InjectRepository(MarketBenchmark)
    private readonly benchmarkRepo: Repository<MarketBenchmark>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
  ) {}

  async forecast(sellerId: string, days: 30 | 60 | 90 = 30): Promise<SalesForecast> {
    const seller = await this.sellerProfileRepo.findOne({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller not found');

    // 1. Query last 180 days of daily revenue
    const since = new Date();
    since.setDate(since.getDate() - 180);

    const dailyRevenue = await this.revenueRecordRepo
      .createQueryBuilder('r')
      .select('r.period', 'date')
      .addSelect('SUM(r.net_revenue)', 'revenue')
      .addSelect('COUNT(*)', 'salesCount')
      .where('r.seller_id = :sellerId', { sellerId: seller.userId })
      .andWhere('r.recorded_at >= :since', { since })
      .groupBy('r.period')
      .orderBy('r.period', 'ASC')
      .getRawMany<{ date: string; revenue: string; salesCount: string }>();

    const revenueData = dailyRevenue.map((d) => ({
      date: d.date,
      revenue: parseFloat(d.revenue) || 0,
      sales: parseInt(d.salesCount, 10) || 0,
    }));

    if (revenueData.length === 0) {
      return {
        forecastDays: days,
        projectedRevenue: 0,
        projectedSales: 0,
        confidenceInterval: { low: 0, high: 0 },
        dailyProjections: [],
        assumptions: ['No historical revenue data available for forecasting.'],
      };
    }

    // 2. Calculate 7-day moving average
    const movingAverages = this.calculateMovingAverage(revenueData.map((d) => d.revenue), 7);
    const latestMA = movingAverages[movingAverages.length - 1] || 0;

    // 3. Calculate month-over-month growth rate
    const growthRate = this.calculateGrowthRate(revenueData.map((d) => d.revenue));

    // 4. Detect seasonal patterns
    const seasonalMultipliers = this.detectSeasonalPatterns(revenueData);

    // 5. Calculate daily sales average for projection
    const totalSales = revenueData.reduce((sum, d) => sum + d.sales, 0);
    const avgDailySales = totalSales / revenueData.length;

    // 6. Project forward
    const dailyProjections: Array<{ date: string; revenue: number }> = [];
    let totalProjectedRevenue = 0;

    const today = new Date();
    for (let i = 1; i <= days; i++) {
      const projDate = new Date(today);
      projDate.setDate(projDate.getDate() + i);
      const dayOfMonth = projDate.getDate();

      const seasonalMult = seasonalMultipliers[dayOfMonth % seasonalMultipliers.length] || 1;
      const projectedDaily = latestMA * (1 + growthRate) * seasonalMult;

      dailyProjections.push({
        date: projDate.toISOString().split('T')[0],
        revenue: Math.round(projectedDaily * 100) / 100,
      });
      totalProjectedRevenue += projectedDaily;
    }

    const projectedSales = Math.round(avgDailySales * (1 + growthRate) * days);

    // Confidence interval: +/- 20% for 30 days, wider for longer periods
    const confidenceWidth = days <= 30 ? 0.2 : days <= 60 ? 0.3 : 0.4;

    const assumptions: string[] = [];
    if (revenueData.length < 30) {
      assumptions.push('Limited historical data (less than 30 days) may reduce accuracy.');
    }
    if (Math.abs(growthRate) > 0.1) {
      assumptions.push(`Monthly growth rate of ${(growthRate * 100).toFixed(1)}% is assumed to continue.`);
    }
    assumptions.push(`Based on ${revenueData.length} days of historical revenue data.`);
    assumptions.push('Seasonal patterns from historical data are factored in.');

    return {
      forecastDays: days,
      projectedRevenue: Math.round(totalProjectedRevenue * 100) / 100,
      projectedSales,
      confidenceInterval: {
        low: Math.round(totalProjectedRevenue * (1 - confidenceWidth) * 100) / 100,
        high: Math.round(totalProjectedRevenue * (1 + confidenceWidth) * 100) / 100,
      },
      dailyProjections,
      assumptions,
    };
  }

  private calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = data.slice(start, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
    return result;
  }

  private calculateGrowthRate(dailyRevenue: number[]): number {
    if (dailyRevenue.length < 60) return 0;

    const mid = Math.floor(dailyRevenue.length / 2);
    const firstHalf = dailyRevenue.slice(0, mid);
    const secondHalf = dailyRevenue.slice(mid);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (firstAvg === 0) return 0;

    const monthlyGrowth = (secondAvg - firstAvg) / firstAvg;
    // Cap growth rate to reasonable bounds
    return Math.max(-0.5, Math.min(0.5, monthlyGrowth));
  }

  private detectSeasonalPatterns(data: Array<{ date: string; revenue: number }>): number[] {
    // Simple seasonal detection based on day-of-month patterns
    const dayBuckets: Record<number, number[]> = {};

    for (const d of data) {
      const day = new Date(d.date).getDate();
      if (!dayBuckets[day]) dayBuckets[day] = [];
      dayBuckets[day].push(d.revenue);
    }

    const overallAvg = data.reduce((sum, d) => sum + d.revenue, 0) / data.length || 1;

    const multipliers: number[] = [];
    for (let i = 1; i <= 31; i++) {
      if (dayBuckets[i] && dayBuckets[i].length > 0) {
        const dayAvg = dayBuckets[i].reduce((a, b) => a + b, 0) / dayBuckets[i].length;
        multipliers.push(dayAvg / overallAvg);
      } else {
        multipliers.push(1);
      }
    }

    return multipliers;
  }
}
