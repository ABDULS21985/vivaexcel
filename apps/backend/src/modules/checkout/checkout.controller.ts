import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response, Request } from 'express';

import { CheckoutService } from './checkout.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { OrderQueryDto } from './dto/order-query.dto';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, JwtUserPayload } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Checkout & Orders')
@Controller()
@UseGuards(RolesGuard, PermissionsGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  // ─── Checkout Endpoints ─────────────────────────────────────────────

  @Post('checkout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Stripe checkout session from cart' })
  @SwaggerResponse({ status: 200, description: 'Checkout session created' })
  @SwaggerResponse({ status: 400, description: 'Cart is empty or invalid' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async createCheckoutSession(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    const result = await this.checkoutService.createCheckoutSession(
      user.sub,
      dto.successUrl,
      dto.cancelUrl,
      dto.couponCode,
    );

    return {
      status: 'success',
      message: 'Checkout session created successfully',
      data: result,
    };
  }

  @Get('checkout/success')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify checkout session and show order confirmation' })
  @ApiQuery({ name: 'session_id', required: true, description: 'Stripe session ID' })
  @SwaggerResponse({ status: 200, description: 'Order details retrieved' })
  @SwaggerResponse({ status: 404, description: 'Order not found for session' })
  async verifyCheckoutSession(
    @Query('session_id') sessionId: string,
  ) {
    const order = await this.checkoutService.verifyCheckoutSession(sessionId);

    return {
      status: 'success',
      message: 'Order verified successfully',
      data: order,
    };
  }

  // ─── User Order Endpoints ──────────────────────────────────────────

  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user orders (paginated)' })
  @SwaggerResponse({ status: 200, description: 'Orders retrieved' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async getUserOrders(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: OrderQueryDto,
  ) {
    const result = await this.checkoutService.getUserOrders(user.sub, query);

    return {
      status: 'success',
      message: 'Orders retrieved successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail with download links' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)' })
  @SwaggerResponse({ status: 200, description: 'Order details retrieved' })
  @SwaggerResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) orderId: string,
  ) {
    const order = await this.checkoutService.getOrderById(user.sub, orderId);

    return {
      status: 'success',
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  // ─── Download Endpoint ──────────────────────────────────────────────

  @Get('downloads/:token')
  @Public()
  @ApiOperation({ summary: 'Download a purchased file using a secure token' })
  @ApiParam({ name: 'token', description: 'Unique download token' })
  @SwaggerResponse({ status: 302, description: 'Redirects to file download URL' })
  @SwaggerResponse({ status: 403, description: 'Download limit reached' })
  @SwaggerResponse({ status: 404, description: 'Invalid or expired token' })
  @SwaggerResponse({ status: 410, description: 'Download link has expired' })
  async downloadFile(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const fileInfo = await this.checkoutService.getDownloadByToken(
      token,
      ipAddress,
    );

    // Set content disposition for download
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileInfo.fileName}"`,
    );
    res.setHeader('Content-Type', fileInfo.mimeType);

    if (fileInfo.fileSize) {
      res.setHeader('Content-Length', fileInfo.fileSize);
    }

    // Redirect to the actual file URL from storage
    res.redirect(fileInfo.url);
  }

  // ─── Admin Endpoints ───────────────────────────────────────────────

  @Get('admin/orders')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'List all orders (admin)' })
  @SwaggerResponse({ status: 200, description: 'Orders retrieved' })
  @SwaggerResponse({ status: 403, description: 'Insufficient permissions' })
  async getAllOrders(@Query() query: OrderQueryDto) {
    const result = await this.checkoutService.getAllOrders(query);

    return {
      status: 'success',
      message: 'Orders retrieved successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get('admin/orders/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get order detail (admin)' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)' })
  @SwaggerResponse({ status: 200, description: 'Order details retrieved' })
  @SwaggerResponse({ status: 404, description: 'Order not found' })
  async getOrderByIdAdmin(
    @Param('id', ParseUUIDPipe) orderId: string,
  ) {
    const order = await this.checkoutService.getOrderByIdAdmin(orderId);

    return {
      status: 'success',
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  @Post('admin/orders/:id/refund')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund an order (admin)' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)' })
  @SwaggerResponse({ status: 200, description: 'Order refunded successfully' })
  @SwaggerResponse({ status: 400, description: 'Order cannot be refunded' })
  @SwaggerResponse({ status: 404, description: 'Order not found' })
  async refundOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
  ) {
    const order = await this.checkoutService.refundOrder(orderId);

    return {
      status: 'success',
      message: 'Order refunded successfully',
      data: order,
    };
  }
}
