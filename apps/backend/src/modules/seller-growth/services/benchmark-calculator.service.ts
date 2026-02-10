import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { DigitalProduct, DigitalProductType, DigitalProductStatus } from '../../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../../entities/digital-product-category.entity';
import { MarketBenchmark } from '../../../entities/market-benchmark.entity';
import { RevenueRecord } from '../../../entities/revenue-record.entity';
import { SellerGoal, GoalStatus } from '../../../entities/seller-goal.entity';
import { SellerInsight, InsightType, InsightPriority, InsightStatus } from '../../../entities/seller-insight.entity';

@Injectable()
export class BenchmarkCalculatorService {
  private readonly logger = new Logger(BenchmarkCalculatorService.name);

  constructor(
    @InjectRepository(DigitalProduct)
    private readonly productRepo: Repository<DigitalProduct>,
    @InjectRepository(DigitalProductCategory)
    private readonly categoryRepo: Repository<DigitalProductCategory>,
    @InjectRepository(MarketBenchmark)
    private readonly benchmarkRepo: Repository<MarketBenchmark>,
    @InjectRepository(RevenueRecord)
    private readonly revenueRecordRepo: Repository<RevenueRecord>,
    @InjectRepository(SellerGoal)
    private readonly goalRepo: Repository<SellerGoal>,
    @InjectRepository(SellerInsight)
    private readonly insightRepo: Repository<SellerInsight>,
  ) {}

  @Cron('0 3 * * *')
  async recalculateBenchmarks(): Promise<void> {
    this.logger.log('Starting daily benchmark recalculation...');

    const categories = await this.categoryRepo.find({ where: { isActive: true } });
    const productTypes = Object.values(DigitalProductType);
    let updatedCount = 0;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    for (const productType of productTypes) {
      // Calculate for each category + null (uncategorized)
      const categoryIds: (string | null)[] = [null, ...categories.map((c) => c.id)];

      for (const categoryId of categoryIds) {
        const qb = this.productRepo
          .createQueryBuilder('p')
          .where('p.type = :type', { type: productType })
          .andWhere('p.status = :status', { status: DigitalProductStatus.PUBLISHED });

        if (categoryId) {
          qb.andWhere('p.category_id = :categoryId', { categoryId });
        } else {
          qb.andWhere('p.category_id IS NULL');
        }

        const products = await qb.getMany();

        if (products.length < 2) continue;

        const prices = products.map((p) => Number(p.price)).sort((a, b) => a - b);
        const ratings = products.map((p) => Number(p.averageRating));

        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const medianPrice = prices[Math.floor(prices.length / 2)];
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

        // Calculate average monthly sales from revenue records
        const salesQuery = this.revenueRecordRepo
          .createQueryBuilder('r')
          .select('COUNT(*)', 'totalSales')
          .innerJoin('r.digitalProduct', 'dp')
          .where('dp.type = :type', { type: productType })
          .andWhere('r.recorded_at >= :since', { since: ninetyDaysAgo });

        if (categoryId) {
          salesQuery.andWhere('dp.category_id = :categoryId', { categoryId });
        }

        const salesResult = await salesQuery.getRawOne<{ totalSales: string }>();
        const totalSales = parseInt(salesResult?.totalSales || '0', 10);
        const avgMonthlySales = totalSales / 3; // 90 days / 3 months

        // Top seller metrics (top 10% by revenue)
        const topCount = Math.max(1, Math.floor(products.length * 0.1));
        const topProducts = [...products]
          .sort((a, b) => Number(b.downloadCount) - Number(a.downloadCount))
          .slice(0, topCount);
        const topPrices = topProducts.map((p) => Number(p.price));
        const topRatings = topProducts.map((p) => Number(p.averageRating));

        await this.benchmarkRepo.upsert(
          {
            productType,
            categoryId: categoryId || undefined,
            averagePrice: Math.round(avgPrice * 100) / 100,
            medianPrice: Math.round(medianPrice * 100) / 100,
            priceRange: { min: prices[0], max: prices[prices.length - 1] },
            averageRating: Math.round(avgRating * 100) / 100,
            averageSalesPerMonth: Math.round(avgMonthlySales * 100) / 100,
            topSellerMetrics: {
              avgPrice: Math.round((topPrices.reduce((a, b) => a + b, 0) / topPrices.length) * 100) / 100,
              avgRating: Math.round((topRatings.reduce((a, b) => a + b, 0) / topRatings.length) * 100) / 100,
              avgMonthlySales: Math.round(avgMonthlySales * 1.5 * 100) / 100,
            },
            sampleSize: products.length,
            calculatedAt: new Date(),
          },
          ['productType', 'categoryId'],
        );

        updatedCount++;
      }
    }

    this.logger.log(`Benchmark recalculation complete. Updated ${updatedCount} benchmarks.`);

    // Also check goal deadlines
    await this.checkGoalDeadlines();
  }

  async checkGoalDeadlines(): Promise<void> {
    this.logger.log('Checking goal deadlines...');

    const now = new Date();
    const expiredGoals = await this.goalRepo
      .createQueryBuilder('g')
      .where('g.status = :status', { status: GoalStatus.ACTIVE })
      .andWhere('g.deadline <= :now', { now })
      .getMany();

    for (const goal of expiredGoals) {
      const achieved = Number(goal.currentValue) >= Number(goal.targetValue);

      goal.status = achieved ? GoalStatus.ACHIEVED : GoalStatus.MISSED;
      await this.goalRepo.save(goal);

      // Create insight
      if (achieved) {
        await this.insightRepo.save(
          this.insightRepo.create({
            sellerId: goal.sellerId,
            insightType: InsightType.PERFORMANCE,
            title: 'Goal Achieved!',
            description: `Congratulations! You achieved your ${goal.type} goal "${goal.title || goal.type}". Current: ${goal.currentValue}, Target: ${goal.targetValue}.`,
            actionItems: [
              { label: 'Set a new goal', action: 'navigate', url: '/seller-dashboard/goals' },
            ],
            priority: InsightPriority.LOW,
            status: InsightStatus.PENDING,
            generatedAt: new Date(),
          }),
        );
      } else {
        const shortfall = Number(goal.targetValue) - Number(goal.currentValue);
        await this.insightRepo.save(
          this.insightRepo.create({
            sellerId: goal.sellerId,
            insightType: InsightType.PERFORMANCE,
            title: 'Goal Not Met',
            description: `Your ${goal.type} goal "${goal.title || goal.type}" fell short by ${shortfall.toFixed(2)}. Current: ${goal.currentValue}, Target: ${goal.targetValue}.`,
            actionItems: [
              { label: 'Review your strategy', action: 'navigate', url: '/seller-dashboard/insights' },
              { label: 'Set a revised goal', action: 'navigate', url: '/seller-dashboard/goals' },
            ],
            priority: InsightPriority.MEDIUM,
            status: InsightStatus.PENDING,
            generatedAt: new Date(),
          }),
        );
      }
    }

    if (expiredGoals.length > 0) {
      this.logger.log(`Processed ${expiredGoals.length} expired goals.`);
    }
  }
}
