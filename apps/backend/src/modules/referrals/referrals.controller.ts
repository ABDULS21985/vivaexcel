import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ReferralsService } from './referrals.service';
import { ReferralQueryDto } from './dto/referral-query.dto';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-code')
  @ApiOperation({ summary: 'Get or create my referral code' })
  async getMyCode(@CurrentUser() user: any) {
    const data = await this.referralsService.getOrCreateReferralCode(user.sub);
    return { status: 'success', message: 'Referral code retrieved', data };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-referrals')
  @ApiOperation({ summary: 'List my referrals' })
  async getMyReferrals(
    @CurrentUser() user: any,
    @Query() query: ReferralQueryDto,
  ) {
    const data = await this.referralsService.getMyReferrals(user.sub, query);
    return { status: 'success', message: 'Referrals retrieved', ...data };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-stats')
  @ApiOperation({ summary: 'Get my referral stats' })
  async getMyStats(@CurrentUser() user: any) {
    const data = await this.referralsService.getMyReferralStats(user.sub);
    return { status: 'success', message: 'Stats retrieved', data };
  }

  @Public()
  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate a referral code' })
  async validateCode(@Param('code') code: string) {
    const data = await this.referralsService.validateCode(code);
    return { status: 'success', message: 'Code validated', data };
  }
}
