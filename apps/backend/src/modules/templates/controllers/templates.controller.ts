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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplatesService } from '../services/templates.service';
import { CreateWebTemplateDto } from '../dto/create-web-template.dto';
import { UpdateWebTemplateDto } from '../dto/update-web-template.dto';
import { WebTemplateQueryDto } from '../dto/web-template-query.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Web Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  async findAll(@Query() query: WebTemplateQueryDto) {
    return this.templatesService.findAll(query);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get template by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.templatesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EDITOR')
  @Permissions('PRODUCT_CREATE')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a template' })
  async create(
    @Body() dto: CreateWebTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.create(dto, userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EDITOR')
  @Permissions('PRODUCT_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a template' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebTemplateDto,
  ) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permissions('PRODUCT_DELETE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a template' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EDITOR')
  @Permissions('PRODUCT_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a template' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.publish(id);
  }

  @Post(':id/archive')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EDITOR')
  @Permissions('PRODUCT_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a template' })
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.archive(id);
  }
}
