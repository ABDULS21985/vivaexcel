import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProfile } from '../../entities/seller-profile.entity';
import { SellerPayout } from '../../entities/seller-payout.entity';
import { SellerApplication } from '../../entities/seller-application.entity';
import { SellersRepository } from './sellers.repository';
import { SellersService } from './services/sellers.service';
import { SellerApplicationsService } from './services/seller-applications.service';
import { SellerPayoutsService } from './services/seller-payouts.service';
import { StripeConnectService } from './services/stripe-connect.service';
import { SellersController } from './controllers/sellers.controller';
import { SellerApplicationsController } from './controllers/seller-applications.controller';
import { SellerAdminController } from './controllers/seller-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SellerProfile,
      SellerPayout,
      SellerApplication,
    ]),
  ],
  controllers: [
    SellersController,
    SellerApplicationsController,
    SellerAdminController,
  ],
  providers: [
    SellersRepository,
    SellersService,
    SellerApplicationsService,
    SellerPayoutsService,
    StripeConnectService,
  ],
  exports: [
    SellersService,
    SellerApplicationsService,
    SellerPayoutsService,
    StripeConnectService,
  ],
})
export class SellersModule {}
