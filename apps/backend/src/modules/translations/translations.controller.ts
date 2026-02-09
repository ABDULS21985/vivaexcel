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
import { TranslationsService } from './translations.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { TranslationQueryDto } from './dto/translation-query.dto';
import {
  TranslatableEntityType,
  SupportedLocale,
} from './entities/content-translation.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Translations')
@Controller('translations')
@UseGuards(RolesGuard, PermissionsGuard)
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  // ============== Public Endpoints ==============

  @Get('locales')
  @Public()
  @ApiOperation({ summary: 'Get all supported locales' })
  @SwaggerResponse({
    status: 200,
    description: 'Supported locales retrieved successfully',
  })
  getSupportedLocales() {
    return this.translationsService.getSupportedLocales();
  }

  @Get('entity-types')
  @Public()
  @ApiOperation({ summary: 'Get all translatable entity types' })
  @SwaggerResponse({
    status: 200,
    description: 'Translatable entity types retrieved successfully',
  })
  getTranslatableEntityTypes() {
    return this.translationsService.getTranslatableEntityTypes();
  }

  @Get('fields')
  @Public()
  @ApiOperation({ summary: 'Get all translatable fields' })
  @SwaggerResponse({
    status: 200,
    description: 'Translatable fields retrieved successfully',
  })
  getTranslatableFields() {
    return this.translationsService.getTranslatableFields();
  }

  @Get('entity/:entityType/:entityId')
  @Public()
  @ApiOperation({ summary: 'Get all translations for an entity' })
  @ApiParam({
    name: 'entityType',
    description: 'Type of entity',
    enum: TranslatableEntityType,
  })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiQuery({ name: 'locale', required: false, enum: SupportedLocale })
  @SwaggerResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  async findByEntity(
    @Param('entityType') entityType: TranslatableEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query('locale') locale?: SupportedLocale,
  ) {
    return this.translationsService.findByEntity(entityType, entityId, locale);
  }

  // ============== Admin Endpoints ==============

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.CONTENT_READ)
  @ApiOperation({ summary: 'Get all translations with filters and pagination' })
  @SwaggerResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  async findAll(@Query() query: TranslationQueryDto) {
    return this.translationsService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.CONTENT_READ)
  @ApiOperation({ summary: 'Get a translation by ID' })
  @ApiParam({ name: 'id', description: 'Translation ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Translation retrieved successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Translation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.translationsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.CONTENT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new translation' })
  @SwaggerResponse({
    status: 201,
    description: 'Translation created successfully',
  })
  @SwaggerResponse({
    status: 409,
    description: 'Translation already exists for this combination',
  })
  async create(@Body() createTranslationDto: CreateTranslationDto) {
    return this.translationsService.create(createTranslationDto);
  }

  @Post('upsert')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.CONTENT_CREATE, Permission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update a translation' })
  @SwaggerResponse({
    status: 200,
    description: 'Translation created or updated successfully',
  })
  async upsert(@Body() createTranslationDto: CreateTranslationDto) {
    return this.translationsService.upsert(createTranslationDto);
  }

  @Post('bulk')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.CONTENT_CREATE, Permission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk create or update translations' })
  @SwaggerResponse({
    status: 200,
    description: 'Translations processed successfully',
  })
  async bulkUpsert(@Body() translations: CreateTranslationDto[]) {
    return this.translationsService.bulkUpsert(translations);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.CONTENT_UPDATE)
  @ApiOperation({ summary: 'Update a translation' })
  @ApiParam({ name: 'id', description: 'Translation ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Translation updated successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Translation not found' })
  @SwaggerResponse({
    status: 409,
    description: 'Translation already exists for this combination',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTranslationDto: UpdateTranslationDto,
  ) {
    return this.translationsService.update(id, updateTranslationDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.CONTENT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a translation' })
  @ApiParam({ name: 'id', description: 'Translation ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Translation deleted successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Translation not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.translationsService.remove(id);
  }

  @Delete('entity/:entityType/:entityId')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.CONTENT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all translations for an entity' })
  @ApiParam({
    name: 'entityType',
    description: 'Type of entity',
    enum: TranslatableEntityType,
  })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Translations deleted successfully',
  })
  async removeByEntity(
    @Param('entityType') entityType: TranslatableEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.translationsService.removeByEntity(entityType, entityId);
  }
}
