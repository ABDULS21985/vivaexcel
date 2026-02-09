import {
  Controller,
  Get,
  Post,
  Patch,
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
import { DigitalProductsService } from '../services/digital-products.service';
import { CreateDigitalProductDto } from '../dto/create-digital-product.dto';
import { UpdateDigitalProductDto } from '../dto/update-digital-product.dto';
import { CreateDigitalProductVariantDto } from '../dto/create-digital-product-variant.dto';
import { UpdateDigitalProductVariantDto } from '../dto/update-digital-product-variant.dto';
import { CreateDigitalProductPreviewDto } from '../dto/create-digital-product-preview.dto';
import { CreateDigitalProductFileDto } from '../dto/create-digital-product-file.dto';
import { DigitalProductQueryDto } from '../dto/digital-product-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Digital Products')
@Controller('digital-products')
@UseGuards(RolesGuard, PermissionsGuard)
export class DigitalProductsController {
  constructor(private readonly digitalProductsService: DigitalProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all digital products with pagination and filters' })
  @SwaggerResponse({ status: 200, description: 'Digital products retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'tagSlug', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minRating', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  @ApiQuery({ name: 'isBestseller', required: false })
  async findAll(@Query() query: DigitalProductQueryDto) {
    return this.digitalProductsService.findAll(query);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get digital product by slug' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @SwaggerResponse({ status: 200, description: 'Digital product retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.digitalProductsService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get digital product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 200, description: 'Digital product retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.digitalProductsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new digital product' })
  @SwaggerResponse({ status: 201, description: 'Digital product created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Product slug already exists' })
  async create(
    @Body() createDto: CreateDigitalProductDto,
    @CurrentUser('sub') creatorId: string,
  ) {
    return this.digitalProductsService.create(createDto, creatorId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 200, description: 'Digital product updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  @SwaggerResponse({ status: 409, description: 'Product slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDigitalProductDto,
  ) {
    return this.digitalProductsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 200, description: 'Digital product deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.digitalProductsService.remove(id);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Publish a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 200, description: 'Digital product published successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.digitalProductsService.publish(id);
  }

  @Post(':id/archive')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Archive a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 200, description: 'Digital product archived successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.digitalProductsService.archive(id);
  }

  // ──────────────────────────────────────────────
  //  Variant endpoints
  // ──────────────────────────────────────────────

  @Post(':id/variants')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a variant for a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 201, description: 'Variant created successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async createVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDigitalProductVariantDto,
  ) {
    return this.digitalProductsService.createVariant(id, dto);
  }

  @Patch(':id/variants/:variantId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a variant of a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @SwaggerResponse({ status: 200, description: 'Variant updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Product or variant not found' })
  async updateVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateDigitalProductVariantDto,
  ) {
    return this.digitalProductsService.updateVariant(id, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a variant of a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @SwaggerResponse({ status: 200, description: 'Variant deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Product or variant not found' })
  async deleteVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.digitalProductsService.deleteVariant(id, variantId);
  }

  // ──────────────────────────────────────────────
  //  Preview endpoints
  // ──────────────────────────────────────────────

  @Post(':id/previews')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a preview for a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 201, description: 'Preview created successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async createPreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDigitalProductPreviewDto,
  ) {
    return this.digitalProductsService.createPreview(id, dto);
  }

  @Delete(':id/previews/:previewId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a preview of a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'previewId', description: 'Preview ID' })
  @SwaggerResponse({ status: 200, description: 'Preview deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Product or preview not found' })
  async deletePreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('previewId', ParseUUIDPipe) previewId: string,
  ) {
    return this.digitalProductsService.deletePreview(id, previewId);
  }

  // ──────────────────────────────────────────────
  //  File endpoints
  // ──────────────────────────────────────────────

  @Post(':id/files')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a file record for a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @SwaggerResponse({ status: 201, description: 'File record created successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async createFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDigitalProductFileDto,
  ) {
    return this.digitalProductsService.createFile(id, dto);
  }

  @Delete(':id/files/:fileId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a file record of a digital product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @SwaggerResponse({ status: 200, description: 'File record deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Product or file not found' })
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
  ) {
    return this.digitalProductsService.deleteFile(id, fileId);
  }
}
