import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AIRecommendationService } from './services/ai-recommendation.service';
import { RecommendationsController } from './recommendations.controller';
import { UserPreferenceProfile } from './entities/user-preference-profile.entity';
import { ProductSimilarity } from './entities/product-similarity.entity';
import { RecommendationLog } from './entities/recommendation-log.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { ProductView } from '../../entities/product-view.entity';
import { AiModule } from '../ai/ai.module';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreferenceProfile,
      ProductSimilarity,
      RecommendationLog,
      DigitalProduct,
      ProductView,
    ]),
    AiModule,
    RedisModule,
    ConfigModule,
  ],
  controllers: [RecommendationsController],
  providers: [AIRecommendationService],
  exports: [AIRecommendationService],
})
export class RecommendationsModule {}
