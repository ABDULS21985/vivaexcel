import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceAnalyticsController } from './controllers/marketplace-analytics.controller';
import { RecommendationsController } from './controllers/recommendations.controller';
import { MarketplaceAnalyticsRepository } from './marketplace-analytics.repository';
import { AnalyticsAggregationService } from './services/analytics-aggregation.service';
import { ReportingService } from './services/reporting.service';
import { RecommendationService } from './services/recommendation.service';
import { ProductView } from '../../entities/product-view.entity';
import { ConversionEvent } from '../../entities/conversion-event.entity';
import { RevenueRecord } from '../../entities/revenue-record.entity';
import { AnalyticsSnapshot } from '../../entities/analytics-snapshot.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductView,
      ConversionEvent,
      RevenueRecord,
      AnalyticsSnapshot,
      DigitalProduct,
    ]),
  ],
  controllers: [MarketplaceAnalyticsController, RecommendationsController],
  providers: [
    MarketplaceAnalyticsRepository,
    AnalyticsAggregationService,
    ReportingService,
    RecommendationService,
  ],
  exports: [ReportingService, RecommendationService],
})
export class MarketplaceAnalyticsModule {}
