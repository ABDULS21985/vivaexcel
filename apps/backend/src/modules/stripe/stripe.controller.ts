import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  RawBodyRequest,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto, CreatePortalDto } from './dto/create-checkout.dto';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser, JwtUserPayload } from '../../common/decorators/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@ApiTags('Stripe')
@Controller('stripe')
@UseGuards(RolesGuard, PermissionsGuard)
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('create-checkout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Stripe Checkout session for subscription' })
  @SwaggerResponse({ status: 200, description: 'Checkout session created' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async createCheckout(
    @CurrentUser() currentUser: JwtUserPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.sub },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ensure user has a Stripe customer ID
    const customerId = await this.stripeService.ensureCustomer(user);

    const session = await this.stripeService.createCheckoutSession(
      customerId,
      dto.priceId,
      dto.successUrl,
      dto.cancelUrl,
    );

    return {
      status: 'success',
      message: 'Checkout session created successfully',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    };
  }

  @Post('create-portal')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Stripe Customer Portal session' })
  @SwaggerResponse({ status: 200, description: 'Portal session created' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async createPortal(
    @CurrentUser() currentUser: JwtUserPayload,
    @Body() dto: CreatePortalDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.sub },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.stripeCustomerId) {
      throw new BadRequestException('No active subscription found. Please subscribe first.');
    }

    const session = await this.stripeService.createPortalSession(
      user.stripeCustomerId,
      dto.returnUrl,
    );

    return {
      status: 'success',
      message: 'Portal session created successfully',
      data: {
        url: session.url,
      },
    };
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @SwaggerResponse({ status: 200, description: 'Webhook processed' })
  @SwaggerResponse({ status: 400, description: 'Invalid webhook payload or signature' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new BadRequestException('Missing raw body for webhook verification');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    await this.stripeService.handleWebhookEvent(rawBody, signature);

    return { received: true };
  }

  @Get('prices')
  @Public()
  @ApiOperation({ summary: 'List available subscription prices' })
  @SwaggerResponse({ status: 200, description: 'Prices listed successfully' })
  async listPrices() {
    const prices = await this.stripeService.listPrices();

    return {
      status: 'success',
      message: 'Prices retrieved successfully',
      data: prices.map((price) => ({
        id: price.id,
        currency: price.currency,
        unitAmount: price.unit_amount,
        recurring: price.recurring,
        product: typeof price.product === 'object' && 'name' in price.product
          ? {
              id: price.product.id,
              name: price.product.name,
              description: (price.product as any).description,
            }
          : { id: price.product },
      })),
    };
  }
}
