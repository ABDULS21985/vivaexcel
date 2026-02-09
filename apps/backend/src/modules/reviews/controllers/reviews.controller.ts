import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { ReviewSortBy } from '../enums/review.enums';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(RolesGuard, PermissionsGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ──────────────────────────────────────────────
  //  Public endpoints (must be declared before :id routes)
  // ──────────────────────────────────────────────

  @Get('product/:productId')
  @Public()
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Product reviews retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ReviewSortBy, description: 'Sort order' })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating (1-5)' })
  async getProductReviews(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sortBy') sortBy?: ReviewSortBy,
    @Query('rating') rating?: string,
  ) {
    return this.reviewsService.getProductReviews(productId, {
      cursor,
      limit,
      sortBy,
      rating: rating ? parseInt(rating, 10) : undefined,
    });
  }

  @Get('product/:productId/stats')
  @Public()
  @ApiOperation({ summary: 'Get review statistics for a product' })
  @ApiParam({ name: 'productId', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Review statistics retrieved successfully' })
  async getReviewStats(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.reviewsService.getReviewStats(productId);
  }

  @Get('top-reviewers')
  @Public()
  @ApiOperation({ summary: 'Get top reviewers leaderboard' })
  @SwaggerResponse({ status: 200, description: 'Top reviewers retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top reviewers to return' })
  async getTopReviewers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.getTopReviewers(limit);
  }

  @Get('recent-purchases/:productId')
  @Public()
  @ApiOperation({ summary: 'Get recent purchase count for social proof' })
  @ApiParam({ name: 'productId', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Recent purchase count retrieved successfully' })
  @ApiQuery({ name: 'hours', required: false, description: 'Lookback window in hours (default 24)' })
  async getRecentPurchases(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    return this.reviewsService.getRecentPurchaseCount(productId, hours);
  }

  @Get('moderation')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get reviews pending moderation' })
  @SwaggerResponse({ status: 200, description: 'Moderation queue retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getModerationQueue(
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.reviewsService.getModerationQueue(cursor, limit);
  }

  @Get('flagged')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get flagged reviews' })
  @SwaggerResponse({ status: 200, description: 'Flagged reviews retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getFlaggedReviews(
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.reviewsService.getFlaggedReviews(cursor, limit);
  }

  // ──────────────────────────────────────────────
  //  Authenticated endpoints
  // ──────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new review' })
  @SwaggerResponse({ status: 201, description: 'Review created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'User already reviewed this product' })
  async createReview(
    @CurrentUser('sub') userId: string,
    @Body() dto: { digitalProductId: string; rating: number; title: string; content: string },
  ) {
    return this.reviewsService.createReview(userId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review (author only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @SwaggerResponse({ status: 200, description: 'Review updated successfully' })
  @SwaggerResponse({ status: 403, description: 'Only the author can update this review' })
  @SwaggerResponse({ status: 404, description: 'Review not found' })
  async updateReview(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { rating?: number; title?: string; content?: string },
  ) {
    return this.reviewsService.updateReview(userId, id, dto);
  }

  @Post(':id/vote')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vote on a review (helpful/not helpful)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @SwaggerResponse({ status: 200, description: 'Vote recorded successfully' })
  @SwaggerResponse({ status: 403, description: 'Cannot vote on own review' })
  @SwaggerResponse({ status: 404, description: 'Review not found' })
  async voteOnReview(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { type: string },
  ) {
    return this.reviewsService.voteOnReview(userId, id, dto as any);
  }

  @Post(':id/report')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @SwaggerResponse({ status: 200, description: 'Review reported successfully' })
  @SwaggerResponse({ status: 404, description: 'Review not found' })
  async reportReview(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string; description?: string },
  ) {
    return this.reviewsService.reportReview(userId, id, dto as any);
  }

  @Post(':id/respond')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a seller response to a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @SwaggerResponse({ status: 200, description: 'Seller response added successfully' })
  @SwaggerResponse({ status: 403, description: 'Only the product owner can respond' })
  @SwaggerResponse({ status: 404, description: 'Review not found' })
  async addSellerResponse(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { sellerResponse: string },
  ) {
    return this.reviewsService.addSellerResponse(userId, id, dto);
  }

  // ──────────────────────────────────────────────
  //  Admin endpoints
  // ──────────────────────────────────────────────

  @Patch(':id/moderate')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Moderate a review (approve/reject)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @SwaggerResponse({ status: 200, description: 'Review moderated successfully' })
  @SwaggerResponse({ status: 404, description: 'Review not found' })
  async moderateReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: string; moderationNote?: string },
  ) {
    return this.reviewsService.moderateReview(id, dto as any);
  }
}
