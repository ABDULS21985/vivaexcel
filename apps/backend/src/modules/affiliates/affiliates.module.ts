import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateProfile } from '../../entities/affiliate-profile.entity';
import { AffiliateLink } from '../../entities/affiliate-link.entity';
import { AffiliateClick } from '../../entities/affiliate-click.entity';
import { AffiliateCommission } from '../../entities/affiliate-commission.entity';
import { AffiliatePayout } from '../../entities/affiliate-payout.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { AffiliatesRepository } from './affiliates.repository';
import { AffiliateService } from './services/affiliate.service';
import { AffiliatePayoutService } from './services/affiliate-payout.service';
import { AffiliateStripeService } from './services/affiliate-stripe.service';
import { AffiliateCronService } from './services/affiliate-cron.service';
import { AffiliateController } from './controllers/affiliate.controller';
import { AffiliateTrackingController } from './controllers/affiliate-tracking.controller';
import { AffiliateAdminController } from './controllers/affiliate-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AffiliateProfile,
      AffiliateLink,
      AffiliateClick,
      AffiliateCommission,
      AffiliatePayout,
      Order,
      OrderItem,
    ]),
  ],
  controllers: [
    AffiliateController,
    AffiliateTrackingController,
    AffiliateAdminController,
  ],
  providers: [
    AffiliatesRepository,
    AffiliateService,
    AffiliatePayoutService,
    AffiliateStripeService,
    AffiliateCronService,
  ],
  exports: [
    AffiliateService,
    AffiliateStripeService,
  ],
})
export class AffiliatesModule {}
