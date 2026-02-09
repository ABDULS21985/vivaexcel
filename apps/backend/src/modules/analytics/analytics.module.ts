import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PageView } from './entities/page-view.entity';
import { Post } from '../../entities/post.entity';
import { NewsletterSubscriber } from '../../entities/newsletter-subscriber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageView, Post, NewsletterSubscriber])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
