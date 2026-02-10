import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplacePlan } from '../../entities/marketplace-plan.entity';
import { MarketplaceSubscription } from '../../entities/marketplace-subscription.entity';
import { CreditTransaction } from '../../entities/credit-transaction.entity';
import { SubscriptionDownload } from '../../entities/subscription-download.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { User } from '../../entities/user.entity';
import { MarketplaceSubscriptionsRepository } from './marketplace-subscriptions.repository';
import { CreditsService } from './services/credits.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionDownloadsService } from './services/subscription-downloads.service';
import { SubscriptionWebhookService } from './services/subscription-webhook.service';
import { CreditsScheduler } from './schedulers/credits.scheduler';
import { PlansController } from './controllers/plans.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { CreditsController } from './controllers/credits.controller';
import { DownloadsController } from './controllers/downloads.controller';
import { StripeModule } from '../stripe/stripe.module';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketplacePlan,
      MarketplaceSubscription,
      CreditTransaction,
      SubscriptionDownload,
      DigitalProduct,
      User,
    ]),
    forwardRef(() => StripeModule),
    RedisModule,
  ],
  controllers: [PlansController, SubscriptionsController, CreditsController, DownloadsController],
  providers: [
    MarketplaceSubscriptionsRepository,
    CreditsService,
    SubscriptionsService,
    SubscriptionDownloadsService,
    SubscriptionWebhookService,
    CreditsScheduler,
  ],
  exports: [SubscriptionWebhookService, SubscriptionsService],
})
export class MarketplaceSubscriptionsModule {}
