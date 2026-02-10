import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PreviewsRepository } from './previews.repository';
import { PreviewGenerationService } from './services/preview-generation.service';
import { PreviewQueryDto } from './dto/preview-query.dto';
import { GeneratePreviewsDto } from './dto/generate-previews.dto';
import { DigitalProductPreviewType } from '../../entities/digital-product-preview.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.constant';

@ApiTags('Previews')
@Controller('previews')
export class PreviewsController {
  constructor(
    private readonly previewsRepository: PreviewsRepository,
    private readonly previewGenerationService: PreviewGenerationService,
  ) {}

  @Get(':productId')
  @ApiOperation({ summary: 'Get all preview assets for a product' })
  @ApiResponse({ status: 200, description: 'Preview assets returned' })
  async getProductPreviews(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: PreviewQueryDto,
  ) {
    const previews = await this.previewsRepository.findByProductId(
      productId,
      query.type,
    );

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const sliced = previews.slice(offset, offset + limit);

    return {
      status: 'success',
      data: {
        items: sliced,
        meta: {
          total: previews.length,
          offset,
          limit,
          hasMore: offset + limit < previews.length,
        },
      },
    };
  }

  @Get(':productId/slides')
  @ApiOperation({ summary: 'Get slide images for a product' })
  async getSlides(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: PreviewQueryDto,
  ) {
    const previews = await this.previewsRepository.findByProductId(
      productId,
      DigitalProductPreviewType.SLIDE_IMAGE,
    );

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const sliced = previews.slice(offset, offset + limit);

    return {
      status: 'success',
      data: {
        items: sliced,
        meta: {
          total: previews.length,
          offset,
          limit,
          hasMore: offset + limit < previews.length,
        },
      },
    };
  }

  @Get(':productId/pages')
  @ApiOperation({ summary: 'Get PDF page images for a product' })
  async getPages(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: PreviewQueryDto,
  ) {
    const previews = await this.previewsRepository.findByProductId(
      productId,
      DigitalProductPreviewType.PDF_PREVIEW,
    );

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;
    const sliced = previews.slice(offset, offset + limit);

    return {
      status: 'success',
      data: {
        items: sliced,
        meta: {
          total: previews.length,
          offset,
          limit,
          hasMore: offset + limit < previews.length,
        },
      },
    };
  }

  @Post(':productId/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger preview generation for a product' })
  @ApiResponse({ status: 202, description: 'Preview generation started' })
  async generatePreviews(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: GeneratePreviewsDto,
  ) {
    // Fire and forget - the generation runs asynchronously
    const result = await this.previewGenerationService.generatePreviews(productId, dto);

    return {
      status: 'success',
      message: 'Preview generation completed',
      data: result,
    };
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all preview assets for a product' })
  async deletePreviews(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const deleted = await this.previewsRepository.deleteByProductId(productId);

    return {
      status: 'success',
      message: `Deleted ${deleted} preview(s)`,
      data: { deleted },
    };
  }
}
