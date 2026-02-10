import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

// Configuration
import { getPinoConfig } from './logging/pino.config';

// Core modules
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './shared/redis/redis.module';
import { CacheModule } from './common/cache/cache.module';

// Observability modules
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

// Middleware
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

// Feature modules
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { ServicesModule } from './modules/services/services.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContactModule } from './modules/contact/contact.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { MediaModule } from './modules/media/media.module';
import { TranslationsModule } from './modules/translations/translations.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { FAQModule } from './modules/faq/faq.module';
import { TestimonyModule } from './modules/testimony/testimony.module';
import { JobApplicationsModule } from './modules/job-applications/job-applications.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { AiModule } from './modules/ai/ai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipModule } from './modules/membership/membership.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { SearchEnhancedModule } from './modules/search/search-enhanced.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DigitalProductsModule } from './modules/digital-products/digital-products.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { PresentationsModule } from './modules/presentations/presentations.module';
import { SolutionDocumentsModule } from './modules/solution-documents/solution-documents.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { PreviewsModule } from './modules/previews/previews.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { TeamsModule } from './modules/teams/teams.module';
import { MarketplaceSubscriptionsModule } from './modules/marketplace-subscriptions/marketplace-subscriptions.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AIAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { ComparisonModule } from './modules/comparison/comparison.module';
import { BundlesModule } from './modules/bundles/bundles.module';
import { ShowcasesModule } from './modules/showcases/showcases.module';
import { DiscussionsModule } from './modules/discussions/discussions.module';
import { ProductQAModule } from './modules/product-qa/product-qa.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { StorefrontApiModule } from './modules/storefront-api/storefront-api.module';
import { EmbedsModule } from './modules/embeds/embeds.module';
import { ContributorsModule } from './modules/contributors/contributors.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReadingHistoryModule } from './modules/reading-history/reading-history.module';
import { SellerGrowthModule } from './modules/seller-growth/seller-growth.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

// Interceptors & Filters
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { ErrorTrackingFilter } from './common/filters/error-tracking.filter';
import { MetricsService } from './metrics/metrics.service';

// App controller (for root endpoint)
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration module - global and cached
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Logging module with Pino
    LoggerModule.forRoot(getPinoConfig()),

    // Rate limiting - 100 requests per minute
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50, // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Database module (PostgreSQL with TypeORM)
    DatabaseModule,

    // Redis module (global)
    RedisModule,

    // Cache module (global - uses Redis)
    CacheModule,

    // Observability modules
    HealthModule,
    MetricsModule,
    MonitoringModule,

    // Email module (global)
    EmailModule,

    // Feature modules
    UsersModule,
    ProductsModule,
    ServicesModule,
    BlogModule,
    ContactModule,
    NewsletterModule,
    MediaModule,
    TranslationsModule,
    ServiceCatalogModule,
    AuthModule,
    UploadModule,
    FAQModule,
    TestimonyModule,
    JobApplicationsModule,
    StripeModule,
    AiModule,
    MembershipModule,
    BookmarksModule,
    SearchEnhancedModule,
    AnalyticsModule,
    DigitalProductsModule,
    CartModule,
    CheckoutModule,
    PresentationsModule,
    SolutionDocumentsModule,
    TemplatesModule,
    PromotionsModule,
    ReviewsModule,
    SellersModule,
    DeliveryModule,
    MarketplaceSubscriptionsModule,
    PreviewsModule,
    GamificationModule,
    AffiliatesModule,
    ReferralsModule,
    TeamsModule,
    RecommendationsModule,
    AIAssistantModule,
    ComparisonModule,
    BundlesModule,
    ShowcasesModule,
    DiscussionsModule,
    ProductQAModule,
    ApiKeysModule,
    WebhooksModule,
    StorefrontApiModule,
    EmbedsModule,
    ContributorsModule,
    SettingsModule,
    ReadingHistoryModule,
    SellerGrowthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global performance metrics interceptor
    {
      provide: APP_INTERCEPTOR,
      useFactory: (metricsService: MetricsService) =>
        new PerformanceInterceptor(metricsService),
      inject: [MetricsService],
    },
    // Global error tracking filter
    {
      provide: APP_FILTER,
      useFactory: (configService: ConfigService) =>
        new ErrorTrackingFilter(configService),
      inject: [ConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply correlation ID middleware to all routes
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
