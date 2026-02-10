import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';

import { StorefrontApiService } from './storefront-api.service';
import {
  StorefrontProductsQueryDto,
  StorefrontSearchQueryDto,
  StorefrontReviewsQueryDto,
} from './dto/storefront-query.dto';
import { AddCartItemDto } from './dto/cart-item.dto';
import { CreateCheckoutDto } from './dto/checkout.dto';

import { Public } from '../../common/decorators/public.decorator';
import { ApiKeyGuard } from '../api-keys/guards/api-key.guard';
import { RequireScopes } from '../api-keys/decorators/require-scopes.decorator';
import { StorefrontResponse } from './interfaces/storefront-response.interface';

/**
 * Storefront API controller.
 *
 * All endpoints are public (no JWT required) but are protected by the
 * ApiKeyGuard, which requires a valid API key in the Authorization header
 * or as a query parameter.
 *
 * Every response uses the standardized StorefrontResponse format.
 */
@ApiTags('Storefront API')
@Controller('storefront')
@Public()
@UseGuards(ApiKeyGuard)
export class StorefrontApiController {
  constructor(private readonly storefrontService: StorefrontApiService) {}

  // ──────────────────────────────────────────────
  //  Products
  // ──────────────────────────────────────────────

  @Get('products')
  @RequireScopes('products:read')
  @ApiOperation({
    summary: 'List products',
    description:
      'Returns a paginated list of published products. ' +
      'Supports cursor-based pagination, filtering by category, type, and price range.',
  })
  @SwaggerResponse({ status: 200, description: 'Products retrieved successfully' })
  async listProducts(
    @Query() query: StorefrontProductsQueryDto,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any[]>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.listProducts(query, baseUrl);
  }

  @Get('products/:slug')
  @RequireScopes('products:read')
  @ApiOperation({
    summary: 'Get product details',
    description: 'Returns full details for a single product by slug.',
  })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @SwaggerResponse({ status: 200, description: 'Product retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Product not found' })
  async getProduct(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.getProductBySlug(slug, baseUrl);
  }

  @Get('products/:slug/reviews')
  @RequireScopes('products:read')
  @ApiOperation({
    summary: 'Get product reviews',
    description:
      'Returns paginated, approved reviews for a product.',
  })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @SwaggerResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Product not found' })
  async getProductReviews(
    @Param('slug') slug: string,
    @Query() query: StorefrontReviewsQueryDto,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any[]>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.getProductReviews(slug, query, baseUrl);
  }

  // ──────────────────────────────────────────────
  //  Categories
  // ──────────────────────────────────────────────

  @Get('categories')
  @RequireScopes('products:read')
  @ApiOperation({
    summary: 'List categories',
    description: 'Returns all active product categories with children.',
  })
  @SwaggerResponse({ status: 200, description: 'Categories retrieved successfully' })
  async listCategories(
    @Req() req: Request,
  ): Promise<StorefrontResponse<any[]>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.listCategories(baseUrl);
  }

  // ──────────────────────────────────────────────
  //  Search
  // ──────────────────────────────────────────────

  @Get('search')
  @RequireScopes('products:read')
  @ApiOperation({
    summary: 'Search products',
    description:
      'Full-text search across product titles and descriptions. ' +
      'Returns paginated results.',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @SwaggerResponse({ status: 200, description: 'Search results retrieved' })
  async searchProducts(
    @Query() query: StorefrontSearchQueryDto,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any[]>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.searchProducts(query, baseUrl);
  }

  // ──────────────────────────────────────────────
  //  Cart
  // ──────────────────────────────────────────────

  @Post('cart')
  @RequireScopes('cart:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new cart',
    description:
      'Creates a new session-based cart. Returns the cart ID to use for subsequent operations.',
  })
  @SwaggerResponse({ status: 201, description: 'Cart created successfully' })
  async createCart(
    @Req() req: Request,
  ): Promise<StorefrontResponse<any>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.createCart(baseUrl);
  }

  @Post('cart/:id/items')
  @RequireScopes('cart:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      'Adds a product (optionally with a variant) to the cart. ' +
      'Idempotent: adding the same product+variant returns the current cart.',
  })
  @ApiParam({ name: 'id', description: 'Cart ID' })
  @SwaggerResponse({ status: 200, description: 'Item added to cart' })
  @SwaggerResponse({ status: 404, description: 'Cart or product not found' })
  async addCartItem(
    @Param('id') cartId: string,
    @Body() dto: AddCartItemDto,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.addCartItem(cartId, dto, baseUrl);
  }

  @Delete('cart/:id/items/:itemId')
  @RequireScopes('cart:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Removes a specific item from the cart.',
  })
  @ApiParam({ name: 'id', description: 'Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @SwaggerResponse({ status: 200, description: 'Item removed from cart' })
  @SwaggerResponse({ status: 404, description: 'Cart or item not found' })
  async removeCartItem(
    @Param('id') cartId: string,
    @Param('itemId') itemId: string,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.removeCartItem(cartId, itemId, baseUrl);
  }

  @Get('cart/:id')
  @RequireScopes('cart:write')
  @ApiOperation({
    summary: 'Get cart',
    description: 'Returns the cart with all items, summary, and pricing.',
  })
  @ApiParam({ name: 'id', description: 'Cart ID' })
  @SwaggerResponse({ status: 200, description: 'Cart retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Cart not found' })
  async getCart(
    @Param('id') cartId: string,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.getCart(cartId, baseUrl);
  }

  // ──────────────────────────────────────────────
  //  Checkout
  // ──────────────────────────────────────────────

  @Post('checkout')
  @RequireScopes('checkout:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create checkout session',
    description:
      'Creates a Stripe Checkout session from a cart. ' +
      'Returns the session URL to redirect the customer to.',
  })
  @SwaggerResponse({ status: 200, description: 'Checkout session created' })
  @SwaggerResponse({ status: 400, description: 'Cart is empty' })
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.createCheckout(dto, baseUrl);
  }

  // ──────────────────────────────────────────────
  //  Sellers
  // ──────────────────────────────────────────────

  @Get('sellers/:slug')
  @RequireScopes('products:read')
  @ApiOperation({
    summary: 'Get seller profile',
    description: 'Returns the public profile for an approved seller.',
  })
  @ApiParam({ name: 'slug', description: 'Seller slug' })
  @SwaggerResponse({ status: 200, description: 'Seller profile retrieved' })
  @SwaggerResponse({ status: 404, description: 'Seller not found' })
  async getSeller(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.getSellerBySlug(slug, baseUrl);
  }

  @Get('sellers/:slug/products')
  @RequireScopes('products:read')
  @ApiOperation({
    summary: "Get seller's products",
    description: "Returns paginated products published by a specific seller.",
  })
  @ApiParam({ name: 'slug', description: 'Seller slug' })
  @SwaggerResponse({ status: 200, description: "Seller's products retrieved" })
  @SwaggerResponse({ status: 404, description: 'Seller not found' })
  async getSellerProducts(
    @Param('slug') slug: string,
    @Query() query: StorefrontProductsQueryDto,
    @Req() req: Request,
  ): Promise<StorefrontResponse<any[]>> {
    const baseUrl = this.getBaseUrl(req);
    return this.storefrontService.getSellerProducts(slug, query, baseUrl);
  }

  // ──────────────────────────────────────────────
  //  Private Helpers
  // ──────────────────────────────────────────────

  /**
   * Extract the base URL from the request for building HATEOAS links.
   */
  private getBaseUrl(req: Request): string {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/api/v1`;
  }
}
