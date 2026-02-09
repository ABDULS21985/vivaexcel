import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, JwtUserPayload } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { SellersService } from '../services/sellers.service';
import { StripeConnectService } from '../services/stripe-connect.service';
import { SellerPayoutsService } from '../services/seller-payouts.service';
import { UpdateSellerProfileDto } from '../dto/update-seller-profile.dto';
import { SellerQueryDto } from '../dto/seller-query.dto';
import { PayoutQueryDto } from '../dto/payout-query.dto';

@ApiTags('Sellers')
@Controller('sellers')
export class SellersController {
  constructor(
    private readonly sellersService: SellersService,
    private readonly stripeConnectService: StripeConnectService,
    private readonly payoutsService: SellerPayoutsService,
  ) {}

  // ─── Public Endpoints ────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List approved sellers' })
  async findAll(@Query() query: SellerQueryDto) {
    const result = await this.sellersService.findPublicSellers(query);
    return { status: 'success', message: 'Sellers retrieved', data: result.items, meta: result.meta };
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get seller by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const seller = await this.sellersService.findBySlug(slug);
    return { status: 'success', message: 'Seller retrieved', data: seller };
  }

  // ─── Authenticated Seller Endpoints ──────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get my seller profile' })
  async getMyProfile(@CurrentUser() user: JwtUserPayload) {
    const seller = await this.sellersService.getMyProfile(user.sub);
    return { status: 'success', message: 'Profile retrieved', data: seller };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Update my seller profile' })
  async updateMyProfile(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: UpdateSellerProfileDto,
  ) {
    const seller = await this.sellersService.updateMyProfile(user.sub, dto);
    return { status: 'success', message: 'Profile updated', data: seller };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/earnings')
  @ApiOperation({ summary: 'Get my earnings summary' })
  async getMyEarnings(@CurrentUser() user: JwtUserPayload) {
    const sellerProfile = await this.sellersService.getMyProfile(user.sub);
    const earnings = await this.payoutsService.getSellerEarnings(sellerProfile.id);
    return { status: 'success', message: 'Earnings retrieved', data: earnings };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/payouts')
  @ApiOperation({ summary: 'Get my payout history' })
  async getMyPayouts(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: PayoutQueryDto,
  ) {
    const sellerProfile = await this.sellersService.getMyProfile(user.sub);
    const result = await this.payoutsService.findBySeller(sellerProfile.id, query);
    return { status: 'success', message: 'Payouts retrieved', data: result.items, meta: result.meta };
  }

  // ─── Stripe Connect ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('me/stripe-connect')
  @ApiOperation({ summary: 'Create Stripe Connect account and get onboarding link' })
  async createStripeConnect(@CurrentUser() user: JwtUserPayload) {
    const seller = await this.sellersService.getMyProfile(user.sub);

    if (!seller.stripeConnectAccountId) {
      await this.stripeConnectService.createConnectAccount(seller.id, user.email);
    }

    const onboardingUrl = await this.stripeConnectService.createOnboardingLink(seller.id);
    return { status: 'success', message: 'Onboarding link created', data: { url: onboardingUrl } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/stripe-connect/status')
  @ApiOperation({ summary: 'Check Stripe Connect onboarding status' })
  async getStripeConnectStatus(@CurrentUser() user: JwtUserPayload) {
    const seller = await this.sellersService.getMyProfile(user.sub);
    const status = await this.stripeConnectService.checkOnboardingStatus(seller.id);
    return { status: 'success', message: 'Status retrieved', data: status };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/stripe-connect/dashboard')
  @ApiOperation({ summary: 'Get Stripe Express dashboard link' })
  async getStripeDashboard(@CurrentUser() user: JwtUserPayload) {
    const seller = await this.sellersService.getMyProfile(user.sub);
    const url = await this.stripeConnectService.createLoginLink(seller.id);
    return { status: 'success', message: 'Dashboard link created', data: { url } };
  }

  // ─── Admin Endpoints ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get seller by ID (admin)' })
  async findById(@Param('id') id: string) {
    const seller = await this.sellersService.findById(id);
    return { status: 'success', message: 'Seller retrieved', data: seller };
  }
}
