import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { MembershipService } from './membership.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import {
  MembershipTierResponseDto,
  SubscriptionStatusResponseDto,
} from './dto/membership-tier.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Membership')
@Controller('membership')
@UseGuards(RolesGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('tiers')
  @Public()
  @ApiOperation({ summary: 'List all active membership tiers' })
  @SwaggerResponse({
    status: 200,
    description: 'Membership tiers retrieved successfully',
    type: [MembershipTierResponseDto],
  })
  async getTiers() {
    return this.membershipService.findAllActiveTiers();
  }

  @Post('subscribe')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subscription' })
  @SwaggerResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SubscriptionStatusResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input or already subscribed' })
  @SwaggerResponse({ status: 404, description: 'Tier not found' })
  async subscribe(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.membershipService.subscribe(userId, dto);
  }

  @Post('cancel')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel current subscription' })
  @SwaggerResponse({
    status: 200,
    description: 'Subscription canceled successfully',
    type: SubscriptionStatusResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'No active subscription found' })
  async cancel(@CurrentUser('sub') userId: string) {
    return this.membershipService.cancelSubscription(userId);
  }

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription status' })
  @SwaggerResponse({
    status: 200,
    description: 'Subscription status retrieved successfully',
    type: SubscriptionStatusResponseDto,
  })
  async getStatus(@CurrentUser('sub') userId: string) {
    return this.membershipService.getSubscriptionStatus(userId);
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  @SwaggerResponse({ status: 200, description: 'Webhook processed' })
  async webhook(@Req() req: RawBodyRequest<Request>) {
    // In production, verify the Stripe signature using req.rawBody
    // and the STRIPE_WEBHOOK_SECRET environment variable.
    const payload = req.body as Record<string, any>;
    return this.membershipService.handleWebhook(payload);
  }
}
