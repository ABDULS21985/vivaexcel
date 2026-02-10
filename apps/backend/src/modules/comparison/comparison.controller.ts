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
  ApiQuery,
} from '@nestjs/swagger';
import { ComparisonService, ComparisonData } from './comparison.service';
import {
  CreateComparisonDto,
  UpdateComparisonDto,
  ComparisonQueryDto,
  QuickCompareQueryDto,
} from './dto';
import { ComparisonSet } from './entities';
import { OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  CurrentUser,
  JwtUserPayload,
} from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/interfaces/response.interface';

@ApiTags('Comparisons')
@Controller('comparisons')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Get('quick')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({
    summary: 'Quick compare products without saving',
    description:
      'Compare 2-4 products by passing comma-separated IDs. No comparison set is persisted.',
  })
  @ApiQuery({
    name: 'ids',
    description: 'Comma-separated product UUIDs',
    example: 'uuid-1,uuid-2,uuid-3',
  })
  @SwaggerResponse({ status: 200, description: 'Comparison data retrieved' })
  @SwaggerResponse({ status: 400, description: 'Invalid product IDs or count' })
  async quickCompare(
    @Query() query: QuickCompareQueryDto,
  ): Promise<ApiResponse<ComparisonData>> {
    const productIds = query.ids.split(',').map((id) => id.trim()).filter(Boolean);

    const data = await this.comparisonService.getQuickCompare(productIds);

    return {
      status: 'success',
      message: 'Comparison data retrieved successfully',
      data,
    };
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a comparison set',
    description: 'Create a persisted comparison set with 2-4 products of the same type.',
  })
  @SwaggerResponse({ status: 201, description: 'Comparison set created' })
  @SwaggerResponse({ status: 400, description: 'Invalid products or type mismatch' })
  async createComparison(
    @CurrentUser() user: JwtUserPayload | null,
    @Body() dto: CreateComparisonDto,
  ): Promise<ApiResponse<ComparisonSet>> {
    const set = await this.comparisonService.createComparison(
      user?.sub,
      dto.sessionId,
      dto.productIds,
    );

    return {
      status: 'success',
      message: 'Comparison set created successfully',
      data: set,
    };
  }

  @Patch(':id')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a comparison set',
    description: 'Add or remove a product from an existing comparison set.',
  })
  @ApiParam({ name: 'id', description: 'Comparison set UUID' })
  @SwaggerResponse({ status: 200, description: 'Comparison set updated' })
  @SwaggerResponse({ status: 400, description: 'Maximum 4 products or type mismatch' })
  @SwaggerResponse({ status: 404, description: 'Comparison set not found' })
  async updateComparison(
    @CurrentUser() user: JwtUserPayload | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComparisonDto,
  ): Promise<ApiResponse<ComparisonSet>> {
    const set = await this.comparisonService.updateComparison(
      id,
      user?.sub,
      dto.sessionId,
      dto.action,
      dto.productId,
    );

    return {
      status: 'success',
      message: `Product ${dto.action === 'add' ? 'added to' : 'removed from'} comparison`,
      data: set,
    };
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get comparison set with full data',
    description: 'Retrieve a comparison set with product details, attribute matrix, and AI insights.',
  })
  @ApiParam({ name: 'id', description: 'Comparison set UUID' })
  @SwaggerResponse({ status: 200, description: 'Comparison data retrieved' })
  @SwaggerResponse({ status: 404, description: 'Comparison set not found' })
  async getComparison(
    @CurrentUser() user: JwtUserPayload | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ComparisonQueryDto,
  ): Promise<ApiResponse<ComparisonData>> {
    const data = await this.comparisonService.getComparison(
      id,
      user?.sub,
      query.sessionId,
    );

    return {
      status: 'success',
      message: 'Comparison data retrieved successfully',
      data,
    };
  }
}
