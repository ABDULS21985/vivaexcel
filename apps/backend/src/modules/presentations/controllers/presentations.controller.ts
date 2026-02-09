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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PresentationsService } from '../services/presentations.service';
import { CreatePresentationDto } from '../dto/create-presentation.dto';
import { UpdatePresentationDto } from '../dto/update-presentation.dto';
import { CreateSlidePreviewDto } from '../dto/create-slide-preview.dto';
import { UpdateSlidePreviewDto } from '../dto/update-slide-preview.dto';
import { PresentationQueryDto } from '../dto/presentation-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Presentations')
@Controller('presentations')
@UseGuards(RolesGuard, PermissionsGuard)
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) {}

  // ──────────────────────────────────────────────
  //  Public endpoints
  // ──────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all presentations with pagination and filters' })
  @SwaggerResponse({ status: 200, description: 'Presentations retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'industry', required: false })
  @ApiQuery({ name: 'presentationType', required: false })
  @ApiQuery({ name: 'fileFormat', required: false })
  @ApiQuery({ name: 'aspectRatio', required: false })
  @ApiQuery({ name: 'hasAnimations', required: false })
  @ApiQuery({ name: 'hasSpeakerNotes', required: false })
  @ApiQuery({ name: 'minSlideCount', required: false })
  @ApiQuery({ name: 'maxSlideCount', required: false })
  @ApiQuery({ name: 'softwareCompatibility', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  async findAll(@Query() query: PresentationQueryDto) {
    return this.presentationsService.findAll(query);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured presentations' })
  @SwaggerResponse({ status: 200, description: 'Featured presentations retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of featured items to return' })
  async getFeatured(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.presentationsService.getFeaturedPresentations(limit);
  }

  @Get('landing')
  @Public()
  @ApiOperation({ summary: 'Get aggregated landing page data' })
  @SwaggerResponse({ status: 200, description: 'Landing page data retrieved successfully' })
  async getLandingPageData() {
    return this.presentationsService.getLandingPageData();
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get industry and type statistics' })
  @SwaggerResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    const [industryStats, typeStats] = await Promise.all([
      this.presentationsService.getIndustryStats(),
      this.presentationsService.getTypeStats(),
    ]);

    return {
      status: 'success',
      message: 'Presentation statistics retrieved successfully',
      data: {
        industryStats: industryStats.data,
        typeStats: typeStats.data,
      },
    };
  }

  @Get('industries/:industry')
  @Public()
  @ApiOperation({ summary: 'Get presentations by industry' })
  @ApiParam({ name: 'industry', description: 'Industry name' })
  @SwaggerResponse({ status: 200, description: 'Presentations by industry retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false })
  async getByIndustry(
    @Param('industry') industry: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.presentationsService.getByIndustry(industry, limit);
  }

  @Get('types/:type')
  @Public()
  @ApiOperation({ summary: 'Get presentations by type' })
  @ApiParam({ name: 'type', description: 'Presentation type' })
  @SwaggerResponse({ status: 200, description: 'Presentations by type retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false })
  async getByType(
    @Param('type') type: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.presentationsService.getByType(type, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get presentation by ID' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'Presentation retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationsService.findById(id);
  }

  // ──────────────────────────────────────────────
  //  Admin CRUD endpoints
  // ──────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new presentation' })
  @SwaggerResponse({ status: 201, description: 'Presentation created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createDto: CreatePresentationDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.presentationsService.create(userId, createDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'Presentation updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePresentationDto,
  ) {
    return this.presentationsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'Presentation deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationsService.delete(id);
  }

  // ──────────────────────────────────────────────
  //  Slide preview endpoints
  // ──────────────────────────────────────────────

  @Get(':id/slides')
  @Public()
  @ApiOperation({ summary: 'Get slide previews for a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'Slide previews retrieved successfully' })
  async getSlidePreviews(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationsService.getSlidePreviews(id);
  }

  @Post(':id/slides')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a slide preview to a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 201, description: 'Slide preview created successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async addSlidePreview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSlidePreviewDto,
  ) {
    return this.presentationsService.addSlidePreview(id, dto);
  }

  @Patch('slides/:slideId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a slide preview' })
  @ApiParam({ name: 'slideId', description: 'Slide preview ID' })
  @SwaggerResponse({ status: 200, description: 'Slide preview updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Slide preview not found' })
  async updateSlidePreview(
    @Param('slideId', ParseUUIDPipe) slideId: string,
    @Body() dto: UpdateSlidePreviewDto,
  ) {
    return this.presentationsService.updateSlidePreview(slideId, dto);
  }

  @Delete('slides/:slideId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a slide preview' })
  @ApiParam({ name: 'slideId', description: 'Slide preview ID' })
  @SwaggerResponse({ status: 200, description: 'Slide preview deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Slide preview not found' })
  async deleteSlidePreview(@Param('slideId', ParseUUIDPipe) slideId: string) {
    return this.presentationsService.deleteSlidePreview(slideId);
  }

  // ──────────────────────────────────────────────
  //  AI endpoints
  // ──────────────────────────────────────────────

  @Post(':id/analyze')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Run full AI analysis on a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'AI analysis completed successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async analyzePresentation(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationsService.analyzePresentation(id);
  }

  @Post(':id/ai/description')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Generate AI description for a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'AI description generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async generateAiDescription(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationsService.generateAiDescription(id);
  }

  @Post(':id/ai/seo')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Generate AI SEO metadata for a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'AI SEO metadata generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async generateAiSeo(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationsService.generateAiSeoMetadata(id);
  }

  @Post(':id/ai/pricing')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Get AI pricing suggestion for a presentation' })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({ status: 200, description: 'AI pricing suggestion generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async suggestAiPricing(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationsService.suggestAiPricing(id);
  }
}
