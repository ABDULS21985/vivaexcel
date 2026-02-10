import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { SearchModule } from './modules/search/search.module';
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
import { GamificationModule } from './modules/gamification/gamification.module';

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
    SearchModule,
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
    GamificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply correlation ID middleware to all routes
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
