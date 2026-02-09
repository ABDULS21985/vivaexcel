import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AIRecommendationService } from './services/ai-recommendation.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  GetAIRecommendationsDto,
  LogRecommendationClickDto,
} from './dto/recommendation.dto';

@ApiTags('AI Recommendations')
@Controller('recommendations')
@UseGuards(RolesGuard, PermissionsGuard)
export class RecommendationsController {
  constructor(
    private readonly aiRecommendationService: AIRecommendationService,
  ) {}

  // ──────────────────────────────────────────────
  //  Content-Based Similar Products (Public)
  // ──────────────────────────────────────────────

  @Get('similar/:productId')
  @Public()
  @ApiOperation({ summary: 'Get similar products based on content-based filtering' })
  @ApiParam({ name: 'productId', description: 'Digital product UUID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of similar products to return (default 8)',
  })
  @SwaggerResponse({ status: 200, description: 'Similar products retrieved successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid product ID format' })
  async getSimilarProducts(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.aiRecommendationService.getSimilarProducts(productId, limit);
  }

  // ──────────────────────────────────────────────
  //  AI-Powered Recommendations (Authenticated)
  // ──────────────────────────────────────────────

  @Get('ai')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-powered product recommendations for the current user' })
  @ApiQuery({
    name: 'context',
    required: false,
    description: 'Natural language context describing what the user is looking for',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of recommendations to return (default 6)',
  })
  @SwaggerResponse({ status: 200, description: 'AI recommendations retrieved successfully' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized — authentication required' })
  async getAIRecommendations(
    @CurrentUser('sub') userId: string,
    @Query('context') context?: string,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit?: number,
  ) {
    return this.aiRecommendationService.getAIRecommendations(userId, context, limit);
  }

  // ──────────────────────────────────────────────
  //  "For You" Personalized Feed (Authenticated)
  // ──────────────────────────────────────────────

  @Get('for-you')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized "For You" product feed for the current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of products to return (default 12)',
  })
  @SwaggerResponse({ status: 200, description: 'For You feed retrieved successfully' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized — authentication required' })
  async getForYouFeed(
    @CurrentUser('sub') userId: string,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit?: number,
  ) {
    return this.aiRecommendationService.getForYouFeed(userId, limit);
  }

  // ──────────────────────────────────────────────
  //  Log Recommendation Click
  // ──────────────────────────────────────────────

  @Post('click')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log a click on a recommended product' })
  @ApiBody({ type: LogRecommendationClickDto })
  @SwaggerResponse({ status: 204, description: 'Click logged successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid request body' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized — authentication required' })
  async logClick(@Body() dto: LogRecommendationClickDto) {
    await this.aiRecommendationService.logClick(
      dto.recommendationLogId,
      dto.clickedProductId,
    );
  }

  // ──────────────────────────────────────────────
  //  Trigger Profile Recomputation (Authenticated)
  // ──────────────────────────────────────────────

  @Post('profile/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger recomputation of the current user preference profile' })
  @SwaggerResponse({ status: 200, description: 'User preference profile updated successfully' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized — authentication required' })
  async updateProfile(@CurrentUser('sub') userId: string) {
    const profile = await this.aiRecommendationService.updateProfile(userId);

    return {
      status: 'success',
      message: 'User preference profile updated successfully',
      data: {
        id: profile.id,
        userId: profile.userId,
        preferredCategories: profile.preferredCategories,
        preferredTypes: profile.preferredTypes,
        priceRangeMin: profile.priceRangeMin,
        priceRangeMax: profile.priceRangeMax,
        lastComputedAt: profile.lastComputedAt,
      },
    };
  }
}
