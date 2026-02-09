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
import { ServiceCatalogService } from './service-catalog.service';
import { CreateServiceTowerDto } from './dto/create-service-tower.dto';
import { UpdateServiceTowerDto } from './dto/update-service-tower.dto';
import { ServiceTowerQueryDto } from './dto/service-tower-query.dto';
import {
  ServiceTowerResponseDto,
  ServiceTowerListResponseDto,
} from './dto/service-tower-response.dto';
import { CreateCatalogServiceDto } from './dto/create-catalog-service.dto';
import { UpdateCatalogServiceDto } from './dto/update-catalog-service.dto';
import { CatalogServiceQueryDto } from './dto/catalog-service-query.dto';
import {
  CatalogServiceResponseDto,
  CatalogServiceListResponseDto,
} from './dto/catalog-service-response.dto';
import { CreateEngagementModelDto } from './dto/create-engagement-model.dto';
import { UpdateEngagementModelDto } from './dto/update-engagement-model.dto';
import {
  EngagementModelResponseDto,
  EngagementModelListResponseDto,
} from './dto/engagement-model-response.dto';
import { CreateIndustryPracticeDto } from './dto/create-industry-practice.dto';
import { UpdateIndustryPracticeDto } from './dto/update-industry-practice.dto';
import {
  IndustryPracticeResponseDto,
  IndustryPracticeListResponseDto,
} from './dto/industry-practice-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Service Catalog')
@Controller('service-catalog')
@UseGuards(RolesGuard, PermissionsGuard)
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  // =====================
  // SERVICE TOWERS
  // =====================

  @Get('towers')
  @Public()
  @ApiOperation({ summary: 'Get all service towers with pagination and filters' })
  @SwaggerResponse({
    status: 200,
    description: 'Service towers retrieved successfully',
    type: ServiceTowerListResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, shortName, or code' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'isFeatured', required: false, description: 'Filter by featured status' })
  async findAllTowers(@Query() query: ServiceTowerQueryDto) {
    return this.serviceCatalogService.findAllTowers(query);
  }

  @Get('towers/:slug')
  @Public()
  @ApiOperation({ summary: 'Get service tower by slug with its services' })
  @ApiParam({ name: 'slug', description: 'Service tower slug' })
  @SwaggerResponse({
    status: 200,
    description: 'Service tower retrieved successfully',
    type: ServiceTowerResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Service tower not found' })
  async findTowerBySlug(@Param('slug') slug: string) {
    return this.serviceCatalogService.findTowerBySlug(slug);
  }

  @Post('towers')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service tower' })
  @SwaggerResponse({
    status: 201,
    description: 'Service tower created successfully',
    type: ServiceTowerResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Service tower slug or code already exists' })
  async createTower(
    @Body() createTowerDto: CreateServiceTowerDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceCatalogService.createTower(createTowerDto, userId);
  }

  @Patch('towers/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update a service tower' })
  @ApiParam({ name: 'id', description: 'Service tower ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Service tower updated successfully',
    type: ServiceTowerResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Service tower not found' })
  @SwaggerResponse({ status: 409, description: 'Service tower slug or code already exists' })
  async updateTower(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTowerDto: UpdateServiceTowerDto,
  ) {
    return this.serviceCatalogService.updateTower(id, updateTowerDto);
  }

  @Delete('towers/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.SERVICE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a service tower' })
  @ApiParam({ name: 'id', description: 'Service tower ID' })
  @SwaggerResponse({ status: 200, description: 'Service tower deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Service tower not found' })
  async removeTower(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCatalogService.removeTower(id);
  }

  // =====================
  // CATALOG SERVICES
  // =====================

  @Get('services')
  @Public()
  @ApiOperation({ summary: 'Get all catalog services with pagination and filters' })
  @SwaggerResponse({
    status: 200,
    description: 'Catalog services retrieved successfully',
    type: CatalogServiceListResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or description' })
  @ApiQuery({ name: 'towerId', required: false, description: 'Filter by tower ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'isFeatured', required: false, description: 'Filter by featured status' })
  async findAllServices(@Query() query: CatalogServiceQueryDto) {
    return this.serviceCatalogService.findAllServices(query);
  }

  @Get('services/:slug')
  @Public()
  @ApiOperation({ summary: 'Get catalog service by slug' })
  @ApiParam({ name: 'slug', description: 'Catalog service slug' })
  @SwaggerResponse({
    status: 200,
    description: 'Catalog service retrieved successfully',
    type: CatalogServiceResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Catalog service not found' })
  async findServiceBySlug(@Param('slug') slug: string) {
    return this.serviceCatalogService.findServiceBySlug(slug);
  }

  @Post('services')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new catalog service' })
  @SwaggerResponse({
    status: 201,
    description: 'Catalog service created successfully',
    type: CatalogServiceResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Catalog service slug already exists' })
  async createService(
    @Body() createServiceDto: CreateCatalogServiceDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceCatalogService.createService(createServiceDto, userId);
  }

  @Patch('services/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update a catalog service' })
  @ApiParam({ name: 'id', description: 'Catalog service ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Catalog service updated successfully',
    type: CatalogServiceResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Catalog service not found' })
  @SwaggerResponse({ status: 409, description: 'Catalog service slug already exists' })
  async updateService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateCatalogServiceDto,
  ) {
    return this.serviceCatalogService.updateService(id, updateServiceDto);
  }

  @Delete('services/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.SERVICE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a catalog service' })
  @ApiParam({ name: 'id', description: 'Catalog service ID' })
  @SwaggerResponse({ status: 200, description: 'Catalog service deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Catalog service not found' })
  async removeService(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCatalogService.removeService(id);
  }

  // =====================
  // ENGAGEMENT MODELS
  // =====================

  @Get('engagement-models')
  @Public()
  @ApiOperation({ summary: 'Get all engagement models' })
  @SwaggerResponse({
    status: 200,
    description: 'Engagement models retrieved successfully',
    type: EngagementModelListResponseDto,
  })
  async findAllEngagementModels() {
    return this.serviceCatalogService.findAllEngagementModels();
  }

  @Post('engagement-models')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new engagement model' })
  @SwaggerResponse({
    status: 201,
    description: 'Engagement model created successfully',
    type: EngagementModelResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Engagement model code or slug already exists' })
  async createEngagementModel(
    @Body() createEngagementModelDto: CreateEngagementModelDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceCatalogService.createEngagementModel(createEngagementModelDto, userId);
  }

  @Patch('engagement-models/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update an engagement model' })
  @ApiParam({ name: 'id', description: 'Engagement model ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Engagement model updated successfully',
    type: EngagementModelResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Engagement model not found' })
  @SwaggerResponse({ status: 409, description: 'Engagement model code or slug already exists' })
  async updateEngagementModel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEngagementModelDto: UpdateEngagementModelDto,
  ) {
    return this.serviceCatalogService.updateEngagementModel(id, updateEngagementModelDto);
  }

  @Delete('engagement-models/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.SERVICE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an engagement model' })
  @ApiParam({ name: 'id', description: 'Engagement model ID' })
  @SwaggerResponse({ status: 200, description: 'Engagement model deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Engagement model not found' })
  async removeEngagementModel(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCatalogService.removeEngagementModel(id);
  }

  // =====================
  // INDUSTRY PRACTICES
  // =====================

  @Get('industry-practices')
  @Public()
  @ApiOperation({ summary: 'Get all industry practices' })
  @SwaggerResponse({
    status: 200,
    description: 'Industry practices retrieved successfully',
    type: IndustryPracticeListResponseDto,
  })
  async findAllIndustryPractices() {
    return this.serviceCatalogService.findAllIndustryPractices();
  }

  @Get('industry-practices/:slug')
  @Public()
  @ApiOperation({ summary: 'Get industry practice by slug' })
  @ApiParam({ name: 'slug', description: 'Industry practice slug' })
  @SwaggerResponse({
    status: 200,
    description: 'Industry practice retrieved successfully',
    type: IndustryPracticeResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Industry practice not found' })
  async findIndustryPracticeBySlug(@Param('slug') slug: string) {
    return this.serviceCatalogService.findIndustryPracticeBySlug(slug);
  }

  @Post('industry-practices')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new industry practice' })
  @SwaggerResponse({
    status: 201,
    description: 'Industry practice created successfully',
    type: IndustryPracticeResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Industry practice code or slug already exists' })
  async createIndustryPractice(
    @Body() createIndustryPracticeDto: CreateIndustryPracticeDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.serviceCatalogService.createIndustryPractice(createIndustryPracticeDto, userId);
  }

  @Patch('industry-practices/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.SERVICE_UPDATE)
  @ApiOperation({ summary: 'Update an industry practice' })
  @ApiParam({ name: 'id', description: 'Industry practice ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Industry practice updated successfully',
    type: IndustryPracticeResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Industry practice not found' })
  @SwaggerResponse({ status: 409, description: 'Industry practice code or slug already exists' })
  async updateIndustryPractice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIndustryPracticeDto: UpdateIndustryPracticeDto,
  ) {
    return this.serviceCatalogService.updateIndustryPractice(id, updateIndustryPracticeDto);
  }

  @Delete('industry-practices/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.SERVICE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an industry practice' })
  @ApiParam({ name: 'id', description: 'Industry practice ID' })
  @SwaggerResponse({ status: 200, description: 'Industry practice deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Industry practice not found' })
  async removeIndustryPractice(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceCatalogService.removeIndustryPractice(id);
  }
}
