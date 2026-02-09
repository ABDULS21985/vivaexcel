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
import { SeriesService } from '../services/series.service';
import { CreateSeriesDto } from '../dto/create-series.dto';
import { UpdateSeriesDto } from '../dto/update-series.dto';
import { AddPostToSeriesDto, ReorderSeriesPostsDto } from '../dto/series-posts.dto';
import { SeriesResponseDto, SeriesListResponseDto } from '../dto/series-response.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Blog - Series')
@Controller('blog/series')
@UseGuards(RolesGuard, PermissionsGuard)
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all series' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @SwaggerResponse({
    status: 200,
    description: 'Series retrieved successfully',
    type: SeriesListResponseDto,
  })
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.seriesService.findAll({
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get a series with its posts by slug' })
  @ApiParam({ name: 'slug', description: 'Series slug' })
  @SwaggerResponse({
    status: 200,
    description: 'Series retrieved successfully',
    type: SeriesResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Series not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.seriesService.getSeriesWithPosts(slug);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new series' })
  @SwaggerResponse({
    status: 201,
    description: 'Series created successfully',
    type: SeriesResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Series slug already exists' })
  async create(
    @Body() createSeriesDto: CreateSeriesDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.seriesService.create(createSeriesDto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_UPDATE)
  @ApiOperation({ summary: 'Update a series' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Series updated successfully',
    type: SeriesResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Series not found' })
  @SwaggerResponse({ status: 409, description: 'Series slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeriesDto: UpdateSeriesDto,
  ) {
    return this.seriesService.update(id, updateSeriesDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.BLOG_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a series (admin only)' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @SwaggerResponse({ status: 200, description: 'Series deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Series not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.seriesService.remove(id);
  }

  @Post(':id/posts')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a post to a series' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Post added to series successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Series or post not found' })
  async addPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPostToSeriesDto,
  ) {
    return this.seriesService.addPostToSeries(id, dto.postId, dto.order);
  }

  @Patch(':id/reorder')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_UPDATE)
  @ApiOperation({ summary: 'Reorder posts within a series' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Series posts reordered successfully',
    type: SeriesResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Series not found' })
  @SwaggerResponse({ status: 400, description: 'Invalid post IDs' })
  async reorderPosts(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderSeriesPostsDto,
  ) {
    return this.seriesService.reorderPosts(id, dto.postIds);
  }
}
