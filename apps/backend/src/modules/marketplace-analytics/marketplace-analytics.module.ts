import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceAnalyticsController } from './controllers/marketplace-analytics.controller';
import { RecommendationsController } from './controllers/recommendations.controller';
import { MarketplaceAnalyticsRepository } from './marketplace-analytics.repository';
import { AnalyticsAggregationService } from './services/analytics-aggregation.service';
import { ReportingService } from './services/reporting.service';
import { RecommendationService } from './services/recommendation.service';
import { UserAnalyticsService } from './services/user-analytics.service';
import { ProductView } from '../../entities/product-view.entity';
import { ConversionEvent } from '../../entities/conversion-event.entity';
import { RevenueRecord } from '../../entities/revenue-record.entity';
import { AnalyticsSnapshot } from '../../entities/analytics-snapshot.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { User } from '../../entities/user.entity';
import { DownloadLog } from '../../entities/download-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductView,
      ConversionEvent,
      RevenueRecord,
      AnalyticsSnapshot,
      DigitalProduct,
      Order,
      OrderItem,
      User,
      DownloadLog,
    ]),
  ],
  controllers: [MarketplaceAnalyticsController, RecommendationsController],
  providers: [
    MarketplaceAnalyticsRepository,
    AnalyticsAggregationService,
    ReportingService,
    RecommendationService,
    UserAnalyticsService,
  ],
  exports: [ReportingService, RecommendationService, UserAnalyticsService],
})
export class MarketplaceAnalyticsModule {}
