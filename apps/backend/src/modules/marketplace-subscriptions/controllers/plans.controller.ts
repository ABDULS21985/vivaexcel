import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { MarketplaceSubscriptionsRepository } from '../marketplace-subscriptions.repository';

@Controller('marketplace-subscriptions/plans')
export class PlansController {
  constructor(private readonly repo: MarketplaceSubscriptionsRepository) {}

  @Public()
  @Get()
  async listActivePlans() {
    const plans = await this.repo.findActivePlans();
    return {
      status: 'success',
      message: 'Active marketplace plans retrieved',
      data: plans,
    };
  }

  @Public()
  @Get(':id')
  async getPlanById(@Param('id') id: string) {
    const plan = await this.repo.findPlanById(id);
    if (!plan) {
      return {
        status: 'error',
        message: 'Plan not found',
      };
    }
    return {
      status: 'success',
      message: 'Plan retrieved',
      data: plan,
    };
  }
}
