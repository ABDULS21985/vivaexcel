import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AffiliateService } from '../services/affiliate.service';
import { AffiliatePayoutService } from '../services/affiliate-payout.service';
import { AffiliateStripeService } from '../services/affiliate-stripe.service';
import { CreateAffiliateApplicationDto } from '../dto/create-affiliate-application.dto';
import { UpdateAffiliateProfileDto } from '../dto/update-affiliate-profile.dto';
import { CreateAffiliateLinkDto } from '../dto/create-affiliate-link.dto';
import { CommissionQueryDto } from '../dto/commission-query.dto';
import { PayoutQueryDto } from '../dto/payout-query.dto';

@ApiTags('Affiliates')
@ApiBearerAuth()
@Controller('affiliates')
@UseGuards(JwtAuthGuard)
export class AffiliateController {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly payoutService: AffiliatePayoutService,
    private readonly stripeService: AffiliateStripeService,
  ) {}

  // ─── Application ──────────────────────────────────────────────────

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become an affiliate' })
  async apply(
    @CurrentUser() user: any,
    @Body() dto: CreateAffiliateApplicationDto,
  ) {
    const data = await this.affiliateService.applyAsAffiliate(user.sub, dto);
    return { status: 'success', message: 'Application submitted successfully', data };
  }

  // ─── Profile ──────────────────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Get my affiliate profile' })
  async getMyProfile(@CurrentUser() user: any) {
    const data = await this.affiliateService.getMyProfile(user.sub);
    return { status: 'success', message: 'Profile retrieved', data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my affiliate profile' })
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateAffiliateProfileDto,
  ) {
    const data = await this.affiliateService.updateMyProfile(user.sub, dto);
    return { status: 'success', message: 'Profile updated', data };
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get affiliate dashboard stats' })
  async getStats(@CurrentUser() user: any) {
    const data = await this.affiliateService.getAffiliateStats(user.sub);
    return { status: 'success', message: 'Stats retrieved', data };
  }

  // ─── Links ────────────────────────────────────────────────────────

  @Get('me/links')
  @ApiOperation({ summary: 'List my affiliate links' })
  async getMyLinks(
    @CurrentUser() user: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.affiliateService.getMyLinks(user.sub, { cursor, limit });
    return { status: 'success', message: 'Links retrieved', ...data };
  }

  @Post('me/links')
  @ApiOperation({ summary: 'Create a new affiliate link' })
  async createLink(
    @CurrentUser() user: any,
    @Body() dto: CreateAffiliateLinkDto,
  ) {
    const data = await this.affiliateService.createLink(user.sub, dto);
    return { status: 'success', message: 'Link created', data };
  }

  @Delete('me/links/:id')
  @ApiOperation({ summary: 'Deactivate an affiliate link' })
  async deleteLink(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.affiliateService.deleteLink(user.sub, id);
    return { status: 'success', message: 'Link deactivated', data };
  }

  // ─── Commissions ──────────────────────────────────────────────────

  @Get('me/commissions')
  @ApiOperation({ summary: 'Get my commission history' })
  async getMyCommissions(
    @CurrentUser() user: any,
    @Query() query: CommissionQueryDto,
  ) {
    const profile = await this.affiliateService.getMyProfile(user.sub);
    const data = await this.affiliateService['repository'].findCommissions({
      ...query,
      affiliateId: profile.id,
    });
    return { status: 'success', message: 'Commissions retrieved', ...data };
  }

  // ─── Payouts ──────────────────────────────────────────────────────

  @Get('me/payouts')
  @ApiOperation({ summary: 'Get my payout history' })
  async getMyPayouts(
    @CurrentUser() user: any,
    @Query() query: PayoutQueryDto,
  ) {
    const profile = await this.affiliateService.getMyProfile(user.sub);
    const data = await this.payoutService.getMyPayouts(profile.id, query);
    return { status: 'success', message: 'Payouts retrieved', ...data };
  }

  @Get('me/earnings')
  @ApiOperation({ summary: 'Get earnings summary' })
  async getEarnings(@CurrentUser() user: any) {
    const profile = await this.affiliateService.getMyProfile(user.sub);
    const data = await this.payoutService.getEarningsSummary(profile.id);
    return { status: 'success', message: 'Earnings retrieved', data };
  }

  // ─── Stripe Connect ──────────────────────────────────────────────

  @Post('me/stripe-connect')
  @ApiOperation({ summary: 'Create Stripe Connect account and get onboarding link' })
  async setupStripeConnect(@CurrentUser() user: any) {
    const profile = await this.affiliateService.getMyProfile(user.sub);

    if (!profile.stripeConnectAccountId) {
      await this.stripeService.createConnectAccount(profile.id, user.email);
    }

    const url = await this.stripeService.createOnboardingLink(profile.id);
    return { status: 'success', message: 'Onboarding link created', data: { url } };
  }

  @Get('me/stripe-connect/status')
  @ApiOperation({ summary: 'Check Stripe Connect onboarding status' })
  async getStripeStatus(@CurrentUser() user: any) {
    const profile = await this.affiliateService.getMyProfile(user.sub);
    const data = await this.stripeService.checkOnboardingStatus(profile.id);
    return { status: 'success', message: 'Status retrieved', data };
  }

  @Post('me/stripe-connect/dashboard')
  @ApiOperation({ summary: 'Get Stripe Express dashboard link' })
  async getStripeDashboard(@CurrentUser() user: any) {
    const profile = await this.affiliateService.getMyProfile(user.sub);
    const url = await this.stripeService.createLoginLink(profile.id);
    return { status: 'success', message: 'Dashboard link created', data: { url } };
  }
}
