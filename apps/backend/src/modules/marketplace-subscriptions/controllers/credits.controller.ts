import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreditsService } from '../services/credits.service';
import { MarketplaceSubscriptionsRepository } from '../marketplace-subscriptions.repository';

@Controller('marketplace-subscriptions/credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly repo: MarketplaceSubscriptionsRepository,
  ) {}

  @Get()
  async getCreditBalance(@CurrentUser('sub') userId: string) {
    const subscription = await this.repo.findActiveSubscriptionByUserId(userId);
    return {
      status: 'success',
      message: 'Credit balance retrieved',
      data: {
        creditsRemaining: subscription?.creditsRemaining || 0,
        creditsUsedThisPeriod: subscription?.creditsUsedThisPeriod || 0,
        totalCreditsUsed: subscription?.totalCreditsUsed || 0,
        rolloverCredits: subscription?.rolloverCreditsAmount || 0,
        monthlyCredits: subscription?.plan?.monthlyCredits || 0,
      },
    };
  }

  @Get('history')
  async getCreditHistory(
    @CurrentUser('sub') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const result = await this.repo.findCreditTransactions(
      userId,
      cursor,
      parsedLimit,
    );
    return {
      status: 'success',
      message: 'Credit history retrieved',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get('analytics')
  async getUsageAnalytics(@CurrentUser('sub') userId: string) {
    const analytics = await this.creditsService.getUsageAnalytics(userId);
    return {
      status: 'success',
      message: 'Usage analytics retrieved',
      data: analytics,
    };
  }
}
