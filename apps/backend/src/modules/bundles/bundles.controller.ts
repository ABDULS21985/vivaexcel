import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
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
} from '@nestjs/swagger';
import {
  CustomBundleService,
  BundleWithProducts,
  BundleSuggestion,
  BundleCheckoutResult,
} from './bundles.service';
import {
  CreateCustomBundleDto,
  UpdateCustomBundleDto,
  BundleQueryDto,
} from './dto';
import {
  OptionalJwtAuthGuard,
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  CurrentUser,
  JwtUserPayload,
} from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/interfaces/response.interface';

@ApiTags('Custom Bundles')
@Controller('bundles')
export class CustomBundleController {
  constructor(private readonly bundleService: CustomBundleService) {}

  @Post('custom')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a custom bundle',
    description: 'Create a custom product bundle with tiered pricing.',
  })
  @SwaggerResponse({ status: 201, description: 'Bundle created' })
  @SwaggerResponse({ status: 400, description: 'Invalid products' })
  async createBundle(
    @CurrentUser() user: JwtUserPayload | null,
    @Body() dto: CreateCustomBundleDto,
  ): Promise<ApiResponse<BundleWithProducts>> {
    const bundle = await this.bundleService.createBundle(
      user?.sub,
      dto.sessionId,
      dto.productIds,
    );

    return {
      status: 'success',
      message: 'Bundle created successfully',
      data: bundle,
    };
  }

  @Get('custom/:id')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a custom bundle',
    description: 'Retrieve a custom bundle with full product details and pricing.',
  })
  @ApiParam({ name: 'id', description: 'Bundle UUID' })
  @SwaggerResponse({ status: 200, description: 'Bundle retrieved' })
  @SwaggerResponse({ status: 404, description: 'Bundle not found' })
  async getBundle(
    @CurrentUser() user: JwtUserPayload | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: BundleQueryDto,
  ): Promise<ApiResponse<BundleWithProducts>> {
    const bundle = await this.bundleService.getBundle(
      id,
      user?.sub,
      query.sessionId,
    );

    return {
      status: 'success',
      message: 'Bundle retrieved successfully',
      data: bundle,
    };
  }

  @Patch('custom/:id')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a custom bundle',
    description: 'Add or remove a product from a custom bundle.',
  })
  @ApiParam({ name: 'id', description: 'Bundle UUID' })
  @SwaggerResponse({ status: 200, description: 'Bundle updated' })
  @SwaggerResponse({ status: 400, description: 'Invalid operation' })
  @SwaggerResponse({ status: 404, description: 'Bundle or product not found' })
  async updateBundle(
    @CurrentUser() user: JwtUserPayload | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomBundleDto,
  ): Promise<ApiResponse<BundleWithProducts>> {
    let bundle: BundleWithProducts;

    if (dto.action === 'add') {
      bundle = await this.bundleService.addToBundle(
        id,
        user?.sub,
        dto.sessionId,
        dto.productId,
      );
    } else {
      bundle = await this.bundleService.removeFromBundle(
        id,
        user?.sub,
        dto.sessionId,
        dto.productId,
      );
    }

    return {
      status: 'success',
      message: `Product ${dto.action === 'add' ? 'added to' : 'removed from'} bundle`,
      data: bundle,
    };
  }

  @Post('custom/:id/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Checkout a custom bundle',
    description:
      'Convert a custom bundle to a cart with a generated discount coupon. ' +
      'Authentication is required for checkout.',
  })
  @ApiParam({ name: 'id', description: 'Bundle UUID' })
  @SwaggerResponse({ status: 200, description: 'Bundle converted to cart' })
  @SwaggerResponse({ status: 400, description: 'Bundle cannot be checked out' })
  @SwaggerResponse({ status: 401, description: 'Authentication required' })
  async checkoutBundle(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<BundleCheckoutResult>> {
    const result = await this.bundleService.checkoutBundle(id, user.sub);

    return {
      status: 'success',
      message: 'Bundle ready for checkout',
      data: result,
    };
  }

  @Get('custom/:id/suggestions')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get bundle addition suggestions',
    description: 'AI-powered suggestions for complementary products to add to the bundle.',
  })
  @ApiParam({ name: 'id', description: 'Bundle UUID' })
  @SwaggerResponse({ status: 200, description: 'Suggestions retrieved' })
  @SwaggerResponse({ status: 404, description: 'Bundle not found' })
  async getBundleSuggestions(
    @CurrentUser() user: JwtUserPayload | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: BundleQueryDto,
  ): Promise<ApiResponse<BundleSuggestion[]>> {
    const suggestions = await this.bundleService.suggestBundleAdditions(
      id,
      user?.sub,
      query.sessionId,
    );

    return {
      status: 'success',
      message: 'Suggestions retrieved successfully',
      data: suggestions,
    };
  }

  @Get('shared/:shareToken')
  @ApiOperation({
    summary: 'Get a shared bundle',
    description: 'Retrieve a bundle by its share token. No authentication required.',
  })
  @ApiParam({ name: 'shareToken', description: 'Bundle share token' })
  @SwaggerResponse({ status: 200, description: 'Shared bundle retrieved' })
  @SwaggerResponse({ status: 404, description: 'Bundle not found' })
  async getSharedBundle(
    @Param('shareToken') shareToken: string,
  ): Promise<ApiResponse<BundleWithProducts>> {
    const bundle = await this.bundleService.getBundleByShareToken(shareToken);

    return {
      status: 'success',
      message: 'Shared bundle retrieved successfully',
      data: bundle,
    };
  }
}
