import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateBlogCategoryDto } from '../dto/create-category.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Blog - Categories')
@Controller('blog/categories')
@UseGuards(RolesGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all blog categories' })
  @SwaggerResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @SwaggerResponse({ status: 200, description: 'Category retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @SwaggerResponse({ status: 200, description: 'Category retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.BLOG_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog category' })
  @SwaggerResponse({ status: 201, description: 'Category created successfully' })
  @SwaggerResponse({ status: 409, description: 'Category slug already exists' })
  async create(@Body() createCategoryDto: CreateBlogCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}
