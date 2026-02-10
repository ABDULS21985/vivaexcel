import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SubscriptionsService } from '../services/subscriptions.service';
import { CreateMarketplaceSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';
import { ChangePlanDto } from '../dto/change-plan.dto';

@Controller('marketplace-subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  async subscribeToPlan(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateMarketplaceSubscriptionDto,
  ) {
    const result = await this.subscriptionsService.subscribeToPlan(userId, dto);
    return {
      status: 'success',
      message: result.checkoutUrl
        ? 'Checkout session created'
        : 'Subscription created successfully',
      data: result,
    };
  }

  @Get('my-subscription')
  async getMySubscription(@CurrentUser('sub') userId: string) {
    const subscription = await this.subscriptionsService.getMySubscription(userId);
    return {
      status: 'success',
      message: subscription
        ? 'Subscription retrieved'
        : 'No active subscription found',
      data: subscription,
    };
  }

  @Post('change-plan')
  async changePlan(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePlanDto,
  ) {
    const subscription = await this.subscriptionsService.changePlan(userId, dto);
    return {
      status: 'success',
      message: 'Plan changed successfully',
      data: subscription,
    };
  }

  @Post('cancel')
  async cancelSubscription(
    @CurrentUser('sub') userId: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    const subscription = await this.subscriptionsService.cancelSubscription(userId, dto);
    return {
      status: 'success',
      message: dto.immediate
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the billing period',
      data: subscription,
    };
  }

  @Post('pause')
  async pauseSubscription(@CurrentUser('sub') userId: string) {
    const subscription = await this.subscriptionsService.pauseSubscription(userId);
    return {
      status: 'success',
      message: 'Subscription paused',
      data: subscription,
    };
  }

  @Post('resume')
  async resumeSubscription(@CurrentUser('sub') userId: string) {
    const subscription = await this.subscriptionsService.resumeSubscription(userId);
    return {
      status: 'success',
      message: 'Subscription resumed',
      data: subscription,
    };
  }
}
