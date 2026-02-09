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
import { SolutionDocumentsService } from '../services/solution-documents.service';
import { CreateSolutionDocumentDto } from '../dto/create-solution-document.dto';
import { UpdateSolutionDocumentDto } from '../dto/update-solution-document.dto';
import { SolutionDocumentQueryDto } from '../dto/solution-document-query.dto';
import { CreateDocumentBundleDto } from '../dto/create-document-bundle.dto';
import { UpdateDocumentBundleDto } from '../dto/update-document-bundle.dto';
import { CreateDocumentUpdateDto } from '../dto/create-document-update.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Solution Documents')
@Controller('solution-documents')
@UseGuards(RolesGuard, PermissionsGuard)
export class SolutionDocumentsController {
  constructor(private readonly solutionDocumentsService: SolutionDocumentsService) {}

  // ──────────────────────────────────────────────
  //  Public endpoints
  // ──────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all solution documents with pagination and filters' })
  @SwaggerResponse({ status: 200, description: 'Solution documents retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'domain', required: false })
  @ApiQuery({ name: 'documentType', required: false })
  @ApiQuery({ name: 'cloudPlatform', required: false })
  @ApiQuery({ name: 'complianceFramework', required: false })
  @ApiQuery({ name: 'technology', required: false })
  @ApiQuery({ name: 'maturityLevel', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'hasEditableDiagrams', required: false })
  @ApiQuery({ name: 'format', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  async findAll(@Query() query: SolutionDocumentQueryDto) {
    return this.solutionDocumentsService.findAll(query);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured solution documents' })
  @SwaggerResponse({ status: 200, description: 'Featured solution documents retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of featured items to return' })
  async getFeatured(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.solutionDocumentsService.getFeatured(limit);
  }

  @Get('landing')
  @Public()
  @ApiOperation({ summary: 'Get aggregated landing page data' })
  @SwaggerResponse({ status: 200, description: 'Landing page data retrieved successfully' })
  async getLandingPageData() {
    return this.solutionDocumentsService.getLandingPageData();
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get domain and type statistics' })
  @SwaggerResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    const [domainStats, typeStats] = await Promise.all([
      this.solutionDocumentsService.getDomainStats(),
      this.solutionDocumentsService.getTypeStats(),
    ]);

    return {
      status: 'success',
      message: 'Solution document statistics retrieved successfully',
      data: {
        domainStats: domainStats.data,
        typeStats: typeStats.data,
      },
    };
  }

  @Get('domains/:domain')
  @Public()
  @ApiOperation({ summary: 'Get solution documents by domain' })
  @ApiParam({ name: 'domain', description: 'Technology domain' })
  @SwaggerResponse({ status: 200, description: 'Documents by domain retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false })
  async getByDomain(
    @Param('domain') domain: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.solutionDocumentsService.getByDomain(domain, limit);
  }

  @Get('types/:type')
  @Public()
  @ApiOperation({ summary: 'Get solution documents by type' })
  @ApiParam({ name: 'type', description: 'Document type' })
  @SwaggerResponse({ status: 200, description: 'Documents by type retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false })
  async getByType(
    @Param('type') type: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.solutionDocumentsService.getByType(type, limit);
  }

  // ──────────────────────────────────────────────
  //  Bundle public endpoints
  // ──────────────────────────────────────────────

  @Get('bundles')
  @Public()
  @ApiOperation({ summary: 'Get all document bundles' })
  @SwaggerResponse({ status: 200, description: 'Document bundles retrieved successfully' })
  async getAllBundles() {
    return this.solutionDocumentsService.getAllBundles();
  }

  @Get('bundles/:idOrSlug')
  @Public()
  @ApiOperation({ summary: 'Get bundle by ID or slug' })
  @ApiParam({ name: 'idOrSlug', description: 'Bundle ID (UUID) or slug' })
  @SwaggerResponse({ status: 200, description: 'Document bundle retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Document bundle not found' })
  async getBundleByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    if (this.isUuid(idOrSlug)) {
      return this.solutionDocumentsService.getBundleById(idOrSlug);
    }
    return this.solutionDocumentsService.getBundleBySlug(idOrSlug);
  }

  // ──────────────────────────────────────────────
  //  Document detail (supports both ID and slug)
  // ──────────────────────────────────────────────

  @Get(':idOrSlug')
  @Public()
  @ApiOperation({ summary: 'Get solution document by ID or slug' })
  @ApiParam({ name: 'idOrSlug', description: 'Document ID (UUID) or slug' })
  @SwaggerResponse({ status: 200, description: 'Solution document retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    if (this.isUuid(idOrSlug)) {
      return this.solutionDocumentsService.findById(idOrSlug);
    }
    return this.solutionDocumentsService.findBySlug(idOrSlug);
  }

  // ──────────────────────────────────────────────
  //  Admin CRUD endpoints
  // ──────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new solution document' })
  @SwaggerResponse({ status: 201, description: 'Solution document created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createDto: CreateSolutionDocumentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.solutionDocumentsService.create(userId, createDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a solution document' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'Solution document updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSolutionDocumentDto,
  ) {
    return this.solutionDocumentsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a solution document' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'Solution document deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.delete(id);
  }

  // ──────────────────────────────────────────────
  //  Bundle admin endpoints
  // ──────────────────────────────────────────────

  @Post('bundles')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a document bundle' })
  @SwaggerResponse({ status: 201, description: 'Document bundle created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  async createBundle(
    @Body() createDto: CreateDocumentBundleDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.solutionDocumentsService.createBundle(userId, createDto);
  }

  @Patch('bundles/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a document bundle' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  @SwaggerResponse({ status: 200, description: 'Document bundle updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Document bundle not found' })
  async updateBundle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDocumentBundleDto,
  ) {
    return this.solutionDocumentsService.updateBundle(id, updateDto);
  }

  @Delete('bundles/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a document bundle' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  @SwaggerResponse({ status: 200, description: 'Document bundle deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Document bundle not found' })
  async removeBundle(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.deleteBundle(id);
  }

  @Post('bundles/:id/documents/:documentId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a document to a bundle' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  @ApiParam({ name: 'documentId', description: 'Solution document ID to add' })
  @SwaggerResponse({ status: 200, description: 'Document added to bundle successfully' })
  @SwaggerResponse({ status: 404, description: 'Bundle or document not found' })
  async addToBundle(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.solutionDocumentsService.addToBundle(id, documentId);
  }

  @Delete('bundles/:id/documents/:documentId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a document from a bundle' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  @ApiParam({ name: 'documentId', description: 'Solution document ID to remove' })
  @SwaggerResponse({ status: 200, description: 'Document removed from bundle successfully' })
  @SwaggerResponse({ status: 404, description: 'Bundle not found' })
  async removeFromBundle(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.solutionDocumentsService.removeFromBundle(id, documentId);
  }

  // ──────────────────────────────────────────────
  //  Version management endpoints
  // ──────────────────────────────────────────────

  @Get(':id/updates')
  @Public()
  @ApiOperation({ summary: 'Get version history for a solution document' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'Document updates retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async getDocumentUpdates(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.getDocumentUpdates(id);
  }

  @Post(':id/updates')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publish a new version update' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 201, description: 'Document update published successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async publishUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDocumentUpdateDto,
  ) {
    return this.solutionDocumentsService.publishUpdate(id, dto);
  }

  // ──────────────────────────────────────────────
  //  AI endpoints
  // ──────────────────────────────────────────────

  @Post(':id/analyze')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Run full AI analysis on a solution document' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'AI analysis completed successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async analyzeDocument(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.analyzeDocument(id);
  }

  @Post(':id/ai/toc')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Generate AI table of contents' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'Table of contents generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async generateToc(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.generateTableOfContents(id);
  }

  @Post(':id/ai/description')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Generate AI description for a solution document' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'AI description generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async generateAiDescription(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.generateAiDescription(id);
  }

  @Post(':id/ai/seo')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Generate AI SEO metadata' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'SEO metadata generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async generateSeo(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.generateSeoDescription(id);
  }

  @Post(':id/ai/tech-stack')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Extract technology stack using AI' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'Technology stack extracted successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async extractTechStack(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.extractTechnologyStack(id);
  }

  @Post(':id/ai/related')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Suggest related documents using AI' })
  @ApiParam({ name: 'id', description: 'Solution document ID' })
  @SwaggerResponse({ status: 200, description: 'Related suggestions generated successfully' })
  @SwaggerResponse({ status: 404, description: 'Solution document not found' })
  async suggestRelated(@Param('id', ParseUUIDPipe) id: string) {
    return this.solutionDocumentsService.suggestRelatedDocuments(id);
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private isUuid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
