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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { CreateServiceCategoryDto } from './dto/create-category.dto';
import { ServiceResponseDto, ServiceListResponseDto } from './dto/service-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Services')
@Controller('services')
@UseGuards(RolesGuard, PermissionsGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all services with pagination and filters' })
  @SwaggerResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: ServiceListResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  async findAll(@Query() query: ServiceQueryDto) {
    return this.servicesService.findAll(query);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all service categories' })
  @SwaggerResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAllCategories() {
    return this.servicesService.findAllCategories();
  }

  @Post('categories')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.SERVICE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service category' })
  @SwaggerResponse({ status: 201, description: 'Category created successfully' })
  @SwaggerResponse({ status: 409, description: 'Category slug already exists' })
  async createCategory(@Body() createCategoryDto: CreateServiceCategoryDto) {
    return this.servicesService.createCategory(createCategoryDto);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get service by slug' })
  @ApiParam({ name: 'slug', description: 'Service slug' })
  @SwaggerResponse({
    status: 200,
    description: 'Service retrieved successfully',
    type: ServiceResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Service not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Service retrieved successfully',
    type: ServiceResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service' })
  @SwaggerResponse({
    status: 201,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Service slug already exists' })
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.servicesService.create(createServiceDto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Service not found' })
  @SwaggerResponse({ status: 409, description: 'Service slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.SERVICE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @SwaggerResponse({ status: 200, description: 'Service deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Service not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.remove(id);
  }
}
