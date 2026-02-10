import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SubscriptionDownloadsService } from '../services/subscription-downloads.service';

@Controller('marketplace-subscriptions/downloads')
@UseGuards(JwtAuthGuard)
export class DownloadsController {
  constructor(
    private readonly downloadsService: SubscriptionDownloadsService,
  ) {}

  @Post(':productId')
  async downloadWithCredits(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    const result = await this.downloadsService.downloadWithCredits(userId, productId);
    return {
      status: 'success',
      message: 'Product downloaded successfully',
      data: result,
    };
  }

  @Get()
  async getMyDownloads(
    @CurrentUser('sub') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const result = await this.downloadsService.getMyDownloads(
      userId,
      cursor,
      parsedLimit,
    );
    return {
      status: 'success',
      message: 'Downloads retrieved',
      data: result.items,
      meta: result.meta,
    };
  }
}
