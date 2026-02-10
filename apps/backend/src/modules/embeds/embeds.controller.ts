import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { EmbedsService } from './embeds.service';
import { EmbedCodeQueryDto } from './dto/embed-code-query.dto';
import { EmbedWidgetType, EmbedTheme } from './enums/embed.enums';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Embeds')
@Controller('embeds')
@UseGuards(RolesGuard, PermissionsGuard)
export class EmbedsController {
  constructor(private readonly embedsService: EmbedsService) {}

  // ---------------------------------------------------------------------------
  // Embed Code Generation
  // ---------------------------------------------------------------------------

  @Get('code')
  @Public()
  @ApiOperation({
    summary: 'Generate embed code snippet',
    description:
      'Generates an HTML snippet with a script tag and widget div that can be copy-pasted into any website.',
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'API key for identifying the embed consumer',
    required: true,
  })
  @SwaggerResponse({
    status: 200,
    description: 'Embed code generated successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Invalid parameters' })
  async getEmbedCode(
    @Query() query: EmbedCodeQueryDto,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (!apiKey) {
      throw new BadRequestException('X-API-Key header is required');
    }

    this.validateEmbedQuery(query);

    const config = {
      type: query.type,
      apiKey,
      productId: query.productId,
      productSlug: query.productSlug,
      categorySlug: query.categorySlug,
      count: query.count,
      theme: query.theme,
      accentColor: query.accentColor,
      borderRadius: query.borderRadius,
      fontFamily: query.fontFamily,
      locale: query.locale,
    };

    const result = this.embedsService.generateEmbedCode(config);

    return {
      status: 'success',
      message: 'Embed code generated successfully',
      data: result,
    };
  }

  // ---------------------------------------------------------------------------
  // Product Data for Embed Rendering
  // ---------------------------------------------------------------------------

  @Get('product/:slugOrId')
  @Public()
  @ApiOperation({
    summary: 'Get product data for embed rendering',
    description:
      'Returns minimal product data optimized for client-side embed widget rendering.',
  })
  @ApiParam({
    name: 'slugOrId',
    description: 'Product slug or UUID',
    example: 'premium-excel-template',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Product data retrieved successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Product not found' })
  async getProductForEmbed(@Param('slugOrId') slugOrId: string) {
    const product =
      await this.embedsService.getProductDataForEmbed(slugOrId);

    return {
      status: 'success',
      message: 'Product data retrieved successfully',
      data: product,
    };
  }

  @Get('products')
  @Public()
  @ApiOperation({
    summary: 'Get products for grid embed',
    description:
      'Returns a list of products optimized for grid widget rendering. Supports category filtering.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Category slug to filter products',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    description: 'Number of products to return (1-24)',
    example: 4,
  })
  @SwaggerResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async getProductsForGrid(
    @Query('category') categorySlug?: string,
    @Query('count') countStr?: string,
  ) {
    let count: number | undefined;

    if (countStr) {
      count = parseInt(countStr, 10);
      if (isNaN(count) || count < 1 || count > 24) {
        throw new BadRequestException(
          'count must be a number between 1 and 24',
        );
      }
    }

    const products = await this.embedsService.getProductsForGrid(
      categorySlug,
      count,
    );

    return {
      status: 'success',
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  // ---------------------------------------------------------------------------
  // Private: Validation
  // ---------------------------------------------------------------------------

  /**
   * Validate that the query parameters are consistent with the widget type.
   */
  private validateEmbedQuery(query: EmbedCodeQueryDto): void {
    if (
      query.type === EmbedWidgetType.PRODUCT_CARD ||
      query.type === EmbedWidgetType.BUY_BUTTON
    ) {
      if (!query.productId && !query.productSlug) {
        throw new BadRequestException(
          `Widget type "${query.type}" requires either productId or productSlug`,
        );
      }
    }

    if (query.type === EmbedWidgetType.PRODUCT_GRID) {
      // categorySlug is optional for grid, no strict validation needed
    }
  }
}
