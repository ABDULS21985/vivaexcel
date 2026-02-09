import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DigitalProductCategoriesService } from '../services/digital-product-categories.service';
import { CreateDigitalProductCategoryDto } from '../dto/create-digital-product-category.dto';
import { UpdateDigitalProductCategoryDto } from '../dto/update-digital-product-category.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Digital Products - Categories')
@Controller('digital-products/categories')
@UseGuards(RolesGuard, PermissionsGuard)
export class DigitalProductCategoriesController {
  constructor(
    private readonly categoriesService: DigitalProductCategoriesService,
  ) {}

  @Get()
  @Public()
  @Header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Get all digital product categories' })
  @SwaggerResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get digital product category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @SwaggerResponse({ status: 200, description: 'Category retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get digital product category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @SwaggerResponse({ status: 200, description: 'Category retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new digital product category' })
  @SwaggerResponse({ status: 201, description: 'Category created successfully' })
  @SwaggerResponse({ status: 409, description: 'Category slug already exists' })
  async create(@Body() createDto: CreateDigitalProductCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a digital product category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @SwaggerResponse({ status: 200, description: 'Category updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Category not found' })
  @SwaggerResponse({ status: 409, description: 'Category slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDigitalProductCategoryDto,
  ) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a digital product category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @SwaggerResponse({ status: 200, description: 'Category deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
