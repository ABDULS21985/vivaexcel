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
import { TemplatesService } from './templates.service';
import { CreateWebTemplateDto } from './dto/create-web-template.dto';
import { UpdateWebTemplateDto } from './dto/update-web-template.dto';
import { WebTemplateQueryDto } from './dto/web-template-query.dto';
import { CreateTemplateDemoDto } from './dto/create-template-demo.dto';
import { CreateTemplateLicenseDto } from './dto/create-template-license.dto';
import { CompatibilityCheckDto } from './dto/compatibility-check.dto';
import { Framework } from '../../entities/web-template.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Web Templates')
@Controller('templates')
@UseGuards(RolesGuard, PermissionsGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ─── Public Endpoints ────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all templates with pagination and filters' })
  @SwaggerResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'templateType', required: false })
  @ApiQuery({ name: 'framework', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'hasTypeScript', required: false })
  async findAll(@Query() query: WebTemplateQueryDto) {
    return this.templatesService.findAll(query);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a template by its slug' })
  @ApiParam({ name: 'slug', description: 'Template slug' })
  @SwaggerResponse({ status: 200, description: 'Template retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Template not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.templatesService.findBySlug(slug);
  }

  @Get('framework/:framework')
  @Public()
  @ApiOperation({ summary: 'Get templates filtered by framework' })
  @ApiParam({ name: 'framework', enum: Framework, description: 'Framework to filter by' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of templates to return' })
  @SwaggerResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findByFramework(
    @Param('framework') framework: Framework,
    @Query('limit') limit?: number,
  ) {
    return this.templatesService.findByFramework(framework, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 200, description: 'Template retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Template not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findById(id);
  }

  @Get(':id/demos')
  @Public()
  @ApiOperation({ summary: 'Get all demos for a template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 200, description: 'Demos retrieved successfully' })
  async getDemos(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findDemos(id);
  }

  @Post('compatibility')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check template compatibility with given requirements' })
  @SwaggerResponse({ status: 200, description: 'Compatibility check completed' })
  async checkCompatibility(@Body() dto: CompatibilityCheckDto) {
    return this.templatesService.checkCompatibility(dto);
  }

  // ─── Admin Endpoints ─────────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.TEMPLATE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new web template' })
  @SwaggerResponse({ status: 201, description: 'Template created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Template slug already exists' })
  async create(
    @Body() dto: CreateWebTemplateDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.templatesService.create(dto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.TEMPLATE_UPDATE)
  @ApiOperation({ summary: 'Update an existing web template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 200, description: 'Template updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Template not found' })
  @SwaggerResponse({ status: 409, description: 'Template slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebTemplateDto,
  ) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.TEMPLATE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a web template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 200, description: 'Template deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Template not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.remove(id);
  }

  // ─── Demo Management ─────────────────────────────────────────────────

  @Post(':id/demos')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.TEMPLATE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a demo for a template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 201, description: 'Demo created successfully' })
  async createDemo(
    @Param('id', ParseUUIDPipe) templateId: string,
    @Body() dto: CreateTemplateDemoDto,
  ) {
    return this.templatesService.createDemo({ ...dto, templateId });
  }

  @Patch('demos/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.TEMPLATE_UPDATE)
  @ApiOperation({ summary: 'Update a template demo' })
  @ApiParam({ name: 'id', description: 'Demo ID' })
  @SwaggerResponse({ status: 200, description: 'Demo updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Demo not found' })
  async updateDemo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateTemplateDemoDto>,
  ) {
    return this.templatesService.updateDemo(id, dto);
  }

  @Delete('demos/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.TEMPLATE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a template demo' })
  @ApiParam({ name: 'id', description: 'Demo ID' })
  @SwaggerResponse({ status: 200, description: 'Demo deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Demo not found' })
  async removeDemo(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.removeDemo(id);
  }

  // ─── License Management ──────────────────────────────────────────────

  @Post('licenses')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.TEMPLATE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new template license' })
  @SwaggerResponse({ status: 201, description: 'License created successfully' })
  async createLicense(@Body() dto: CreateTemplateLicenseDto) {
    return this.templatesService.createLicense(dto);
  }

  @Get('licenses/validate/:key')
  @Public()
  @ApiOperation({ summary: 'Validate a template license key' })
  @ApiParam({ name: 'key', description: 'License key to validate' })
  @SwaggerResponse({ status: 200, description: 'License validation result' })
  @SwaggerResponse({ status: 404, description: 'License not found' })
  async validateLicense(@Param('key') key: string) {
    return this.templatesService.validateLicense(key);
  }

  @Post('licenses/activate/:key')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a template license' })
  @ApiParam({ name: 'key', description: 'License key to activate' })
  @SwaggerResponse({ status: 200, description: 'License activated successfully' })
  @SwaggerResponse({ status: 400, description: 'License cannot be activated' })
  @SwaggerResponse({ status: 404, description: 'License not found' })
  async activateLicense(@Param('key') key: string) {
    return this.templatesService.activateLicense(key);
  }

  @Post('licenses/deactivate/:key')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.TEMPLATE_UPDATE)
  @ApiOperation({ summary: 'Deactivate a template license' })
  @ApiParam({ name: 'key', description: 'License key to deactivate' })
  @SwaggerResponse({ status: 200, description: 'License deactivated successfully' })
  @SwaggerResponse({ status: 404, description: 'License not found' })
  async deactivateLicense(@Param('key') key: string) {
    return this.templatesService.deactivateLicense(key);
  }

  @Get('licenses/user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all licenses for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @SwaggerResponse({ status: 200, description: 'User licenses retrieved successfully' })
  async getUserLicenses(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.templatesService.getUserLicenses(userId);
  }

  // ─── AI Endpoints ────────────────────────────────────────────────────

  @Post(':id/ai/suggest-pricing')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.TEMPLATE_READ)
  @ApiOperation({ summary: 'Get AI-powered pricing suggestions for a template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 200, description: 'Pricing suggestion generated' })
  @SwaggerResponse({ status: 404, description: 'Template not found' })
  async suggestPricing(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.suggestPricing(id);
  }

  @Post(':id/ai/generate-description')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.TEMPLATE_READ)
  @ApiOperation({ summary: 'Generate AI-powered description for a template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 200, description: 'Description generated' })
  @SwaggerResponse({ status: 404, description: 'Template not found' })
  async generateDescription(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.generateDescription(id);
  }

  @Post(':id/ai/suggest-seo')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.TEMPLATE_READ)
  @ApiOperation({ summary: 'Get AI-powered SEO keyword suggestions for a template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @SwaggerResponse({ status: 200, description: 'SEO keywords suggested' })
  @SwaggerResponse({ status: 404, description: 'Template not found' })
  async suggestSeoKeywords(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.suggestSeoKeywords(id);
  }
}
