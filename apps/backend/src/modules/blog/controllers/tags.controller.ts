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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Blog - Tags')
@Controller('blog/tags')
@UseGuards(RolesGuard, PermissionsGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all blog tags' })
  @SwaggerResponse({ status: 200, description: 'Tags retrieved successfully' })
  async findAll() {
    return this.tagsService.findAll();
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get tag by slug' })
  @ApiParam({ name: 'slug', description: 'Tag slug' })
  @SwaggerResponse({ status: 200, description: 'Tag retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Tag not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @SwaggerResponse({ status: 200, description: 'Tag retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Tag not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog tag' })
  @SwaggerResponse({ status: 201, description: 'Tag created successfully' })
  @SwaggerResponse({ status: 409, description: 'Tag slug already exists' })
  async create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_UPDATE)
  @ApiOperation({ summary: 'Update a blog tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @SwaggerResponse({ status: 200, description: 'Tag updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Tag not found' })
  @SwaggerResponse({ status: 409, description: 'Tag slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.BLOG_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a blog tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @SwaggerResponse({ status: 200, description: 'Tag deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Tag not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.remove(id);
  }
}
