import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { SellerInsight } from '../../entities/seller-insight.entity';
import { SellerGoal } from '../../entities/seller-goal.entity';
import { MarketBenchmark } from '../../entities/market-benchmark.entity';
import { SellerResource } from '../../entities/seller-resource.entity';
import { SellerProfile } from '../../entities/seller-profile.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../entities/digital-product-category.entity';
import { RevenueRecord } from '../../entities/revenue-record.entity';
import { ProductView } from '../../entities/product-view.entity';
import { ConversionEvent } from '../../entities/conversion-event.entity';
import { SearchQuery } from '../search/entities/search-query.entity';

// Modules
import { AiModule } from '../ai/ai.module';
import { NotificationCenterModule } from '../notification-center/notification-center.module';

// Services
import { PricingOptimizerService } from './services/pricing-optimizer.service';
import { ListingScorerService } from './services/listing-scorer.service';
import { MarketOpportunityService } from './services/market-opportunity.service';
import { SalesForecastingService } from './services/sales-forecasting.service';
import { BenchmarkCalculatorService } from './services/benchmark-calculator.service';
import { SellerCoachingService } from './services/seller-coaching.service';

// Controllers
import { SellerInsightsController } from './controllers/seller-insights.controller';
import { SellerGoalsController } from './controllers/seller-goals.controller';
import { SellerResourcesController } from './controllers/seller-resources.controller';
import { MarketAnalysisController } from './controllers/market-analysis.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SellerInsight,
      SellerGoal,
      MarketBenchmark,
      SellerResource,
      SellerProfile,
      DigitalProduct,
      DigitalProductCategory,
      RevenueRecord,
      ProductView,
      ConversionEvent,
      SearchQuery,
    ]),
    AiModule,
    NotificationCenterModule,
  ],
  controllers: [
    SellerInsightsController,
    SellerGoalsController,
    SellerResourcesController,
    MarketAnalysisController,
  ],
  providers: [
    PricingOptimizerService,
    ListingScorerService,
    MarketOpportunityService,
    SalesForecastingService,
    BenchmarkCalculatorService,
    SellerCoachingService,
  ],
  exports: [
    PricingOptimizerService,
    ListingScorerService,
    MarketOpportunityService,
    SalesForecastingService,
    BenchmarkCalculatorService,
    SellerCoachingService,
  ],
})
export class SellerGrowthModule {}
