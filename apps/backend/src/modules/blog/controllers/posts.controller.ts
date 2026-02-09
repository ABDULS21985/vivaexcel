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
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostQueryDto } from '../dto/post-query.dto';
import { PostResponseDto, PostListResponseDto } from '../dto/post-response.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { ContentAccessGuard } from '../../../common/guards/content-access.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Blog - Posts')
@Controller('blog/posts')
@UseGuards(RolesGuard, PermissionsGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all blog posts with pagination and filters' })
  @SwaggerResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: PostListResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'tagId', required: false })
  async findAll(@Query() query: PostQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get('slug/:slug')
  @Public()
  @UseGuards(ContentAccessGuard)
  @ApiOperation({ summary: 'Get post by slug (content gating applied based on visibility and user subscription)' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @SwaggerResponse({
    status: 200,
    description: 'Post retrieved successfully. For gated posts, returns preview with requiresSubscription and minimumTier fields.',
    type: PostResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.postsService.findBySlug(slug, userId);
  }

  @Get(':id')
  @Public()
  @UseGuards(ContentAccessGuard)
  @ApiOperation({ summary: 'Get post by ID (content gating applied based on visibility and user subscription)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Post retrieved successfully. For gated posts, returns preview with requiresSubscription and minimumTier fields.',
    type: PostResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.postsService.findById(id, userId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog post' })
  @SwaggerResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Post slug already exists' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser('sub') authorId: string,
  ) {
    return this.postsService.create(createPostDto, authorId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_UPDATE)
  @ApiOperation({ summary: 'Update a blog post (automatically creates a revision snapshot)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  @SwaggerResponse({ status: 409, description: 'Post slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.postsService.update(id, updatePostDto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.BLOG_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a blog post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @SwaggerResponse({ status: 200, description: 'Post deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_PUBLISH)
  @ApiOperation({ summary: 'Publish a blog post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Post published successfully',
    type: PostResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.BLOG_PUBLISH)
  @ApiOperation({ summary: 'Unpublish a blog post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Post unpublished successfully',
    type: PostResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.unpublish(id);
  }
}
