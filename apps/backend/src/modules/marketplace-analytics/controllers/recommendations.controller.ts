import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
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
import { RecommendationService } from '../services/recommendation.service';
import { Public } from '../../../common/decorators/public.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(RolesGuard, PermissionsGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationService: RecommendationService,
  ) {}

  // ──────────────────────────────────────────────
  //  Product-based recommendations (Public)
  // ──────────────────────────────────────────────

  @Get('product/:id')
  @Public()
  @ApiOperation({ summary: 'Get product recommendations (frequently bought together and also viewed)' })
  @ApiParam({ name: 'id', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Product recommendations retrieved successfully' })
  async getProductRecommendations(
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    const [boughtTogether, alsoViewed] = await Promise.all([
      this.recommendationService.getFrequentlyBoughtTogether(productId),
      this.recommendationService.getCustomersAlsoViewed(productId),
    ]);

    return {
      status: 'success',
      message: 'Product recommendations retrieved successfully',
      data: {
        frequentlyBoughtTogether: boughtTogether.data,
        customersAlsoViewed: alsoViewed.data,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Trending products (Public)
  // ──────────────────────────────────────────────

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending products based on recent view velocity' })
  @SwaggerResponse({ status: 200, description: 'Trending products retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of trending products to return (default 10)' })
  async getTrending(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.recommendationService.getTrending(limit);
  }

  // ──────────────────────────────────────────────
  //  Personalized recommendations (Authenticated)
  // ──────────────────────────────────────────────

  @Get('user/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized product recommendations for a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @SwaggerResponse({ status: 200, description: 'Personalized recommendations retrieved successfully' })
  async getPersonalizedRecommendations(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.recommendationService.getPersonalizedRecommendations(id);
  }

  // ──────────────────────────────────────────────
  //  Product badges (Public)
  // ──────────────────────────────────────────────

  @Get('product/:id/badges')
  @Public()
  @ApiOperation({ summary: 'Get product badges (trending, bestseller, new, hot)' })
  @ApiParam({ name: 'id', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Product badges retrieved successfully' })
  async getProductBadges(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.recommendationService.getProductBadges(id);
  }
}
