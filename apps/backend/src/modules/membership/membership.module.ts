import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { MembershipTier } from '../../entities/membership-tier.entity';
import { Subscription } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipTier, Subscription, User])],
  controllers: [MembershipController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
