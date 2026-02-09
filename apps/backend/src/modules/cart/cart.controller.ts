import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CartService, CartWithSummary } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartQueryDto } from './dto/cart-query.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import {
  OptionalJwtAuthGuard,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser, JwtUserPayload } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/interfaces/response.interface';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current cart with items',
    description:
      'Retrieves the current cart for the authenticated user or guest session. ' +
      'For authenticated users, the cart is tied to the user ID. ' +
      'For guests, pass a sessionId query parameter.',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID for guest cart identification',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Cart retrieved successfully with items and summary',
  })
  async getCart(
    @CurrentUser() user: JwtUserPayload | null,
    @Query() query: CartQueryDto,
  ): Promise<ApiResponse<CartWithSummary>> {
    const userId = user?.sub;
    const sessionId = query.sessionId;

    const result = await this.cartService.getCartWithItems(userId, sessionId);

    return {
      status: 'success',
      message: 'Cart retrieved successfully',
      data: result,
    };
  }

  @Post('items')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      'Adds a digital product (optionally with a specific variant) to the cart. ' +
      'Idempotent: if the product+variant already exists in the cart, the existing cart is returned.',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID for guest cart identification',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Item added to cart successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Product not available' })
  @SwaggerResponse({ status: 404, description: 'Product or variant not found' })
  async addItem(
    @CurrentUser() user: JwtUserPayload | null,
    @Body() addCartItemDto: AddCartItemDto,
    @Query() query: CartQueryDto,
  ): Promise<ApiResponse<CartWithSummary>> {
    const userId = user?.sub;
    const sessionId = query.sessionId;

    const result = await this.cartService.addItem(
      userId,
      sessionId,
      addCartItemDto.digitalProductId,
      addCartItemDto.variantId,
    );

    return {
      status: 'success',
      message: 'Item added to cart successfully',
      data: result,
    };
  }

  @Delete('items/:itemId')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Removes a specific item from the cart by its cart item ID.',
  })
  @ApiParam({ name: 'itemId', description: 'Cart item ID to remove' })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID for guest cart identification',
  })
  @SwaggerResponse({ status: 200, description: 'Item removed from cart' })
  @SwaggerResponse({
    status: 404,
    description: 'Cart item not found in your cart',
  })
  async removeItem(
    @CurrentUser() user: JwtUserPayload | null,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Query() query: CartQueryDto,
  ): Promise<ApiResponse<CartWithSummary>> {
    const userId = user?.sub;
    const sessionId = query.sessionId;

    const result = await this.cartService.removeItem(userId, sessionId, itemId);

    return {
      status: 'success',
      message: 'Item removed from cart successfully',
      data: result,
    };
  }

  @Delete()
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Removes all items from the cart.',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID for guest cart identification',
  })
  @SwaggerResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(
    @CurrentUser() user: JwtUserPayload | null,
    @Query() query: CartQueryDto,
  ): Promise<ApiResponse<null>> {
    const userId = user?.sub;
    const sessionId = query.sessionId;

    await this.cartService.clearCart(userId, sessionId);

    return {
      status: 'success',
      message: 'Cart cleared successfully',
      data: null,
    };
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Merge guest cart into user cart',
    description:
      'After login, merges items from a guest cart (identified by sessionId) ' +
      'into the authenticated user\'s cart. Duplicate items are skipped. ' +
      'The guest cart is marked as merged.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Guest cart merged into user cart successfully',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Authentication required',
  })
  async mergeCart(
    @CurrentUser() user: JwtUserPayload,
    @Body() mergeCartDto: MergeCartDto,
  ): Promise<ApiResponse<CartWithSummary>> {
    const result = await this.cartService.mergeGuestCart(
      user.sub,
      mergeCartDto.sessionId,
    );

    return {
      status: 'success',
      message: 'Cart merged successfully',
      data: result,
    };
  }
}
