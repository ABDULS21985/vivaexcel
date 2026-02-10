import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';
import { VideosService } from '../services/videos.service';
import { VideoQueryDto } from '../dto/video-query.dto';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateVideoCommentDto } from '../dto/create-comment.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Role } from '../../../common/constants/roles.constant';

@Controller('videos')
@UseGuards(RolesGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // ──────────────────────────────────────────────
  //  Static public routes (MUST be before :slug)
  // ──────────────────────────────────────────────

  @Get('shorts')
  @Public()
  async findShorts() {
    const data = await this.videosService.findShorts();
    return { status: 'success', message: 'Shorts retrieved', data };
  }

  @Get('categories')
  @Public()
  async findCategories() {
    const data = await this.videosService.findAllCategories();
    return { status: 'success', message: 'Categories retrieved', data };
  }

  @Get('channels')
  @Public()
  async findChannels() {
    const data = await this.videosService.findAllChannels();
    return { status: 'success', message: 'Channels retrieved', data };
  }

  @Get('trending')
  @Public()
  async findTrending(@Query('limit') limit?: string) {
    const data = await this.videosService.findTrending(limit ? parseInt(limit, 10) : 5);
    return { status: 'success', message: 'Trending videos retrieved', data };
  }

  // ──────────────────────────────────────────────
  //  Authenticated static routes (before :slug)
  // ──────────────────────────────────────────────

  @Get('me/bookmarks')
  async getMyBookmarks(@CurrentUser('sub') userId: string) {
    const data = await this.videosService.getUserBookmarks(userId);
    return { status: 'success', message: 'Bookmarks retrieved', data };
  }

  // ──────────────────────────────────────────────
  //  Public paginated list
  // ──────────────────────────────────────────────

  @Get()
  @Public()
  async findAll(@Query() query: VideoQueryDto) {
    const data = await this.videosService.findAll(query);
    return { status: 'success', message: 'Videos retrieved', data };
  }

  // ──────────────────────────────────────────────
  //  Admin CRUD (before :slug param routes)
  // ──────────────────────────────────────────────

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVideoDto) {
    const data = await this.videosService.create(dto);
    return { status: 'success', message: 'Video created', data };
  }

  @Post('categories')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto) {
    const data = await this.videosService.createCategory(dto);
    return { status: 'success', message: 'Category created', data };
  }

  @Post('channels')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createChannel(@Body() dto: CreateChannelDto) {
    const data = await this.videosService.createChannel(dto);
    return { status: 'success', message: 'Channel created', data };
  }

  // ──────────────────────────────────────────────
  //  Delete comment route (before :slug to avoid conflict)
  // ──────────────────────────────────────────────

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  async deleteComment(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.videosService.deleteComment(userId, id);
    return { status: 'success', message: 'Comment deleted', data: null };
  }

  // ──────────────────────────────────────────────
  //  Param routes: :slug and :id
  // ──────────────────────────────────────────────

  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.videosService.findBySlug(slug);
    return { status: 'success', message: 'Video retrieved', data };
  }

  @Get(':slug/comments')
  @Public()
  async getComments(@Param('slug') slug: string) {
    const video = await this.videosService.findBySlug(slug);
    const data = await this.videosService.getComments(video.id);
    return { status: 'success', message: 'Comments retrieved', data };
  }

  @Post(':id/views')
  @Public()
  @HttpCode(HttpStatus.OK)
  async recordView(@Param('id') id: string, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const ipHash = createHash('sha256').update(ip).digest('hex').substring(0, 16);
    const userAgent = req.headers['user-agent'];
    await this.videosService.recordView(id, undefined, ipHash, userAgent);
    return { status: 'success', message: 'View recorded', data: null };
  }

  @Post(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  async toggleBookmark(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.videosService.toggleBookmark(userId, id);
    return { status: 'success', message: data.bookmarked ? 'Video bookmarked' : 'Bookmark removed', data };
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.videosService.toggleLike(userId, id);
    return { status: 'success', message: data.liked ? 'Video liked' : 'Like removed', data };
  }

  @Post(':slug/comments')
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @CurrentUser('sub') userId: string,
    @Param('slug') slug: string,
    @Body() dto: CreateVideoCommentDto,
  ) {
    const video = await this.videosService.findBySlug(slug);
    const data = await this.videosService.addComment(userId, video.id, dto);
    return { status: 'success', message: 'Comment added', data };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVideoDto,
  ) {
    const data = await this.videosService.update(id, dto);
    return { status: 'success', message: 'Video updated', data };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.videosService.remove(id);
    return { status: 'success', message: 'Video deleted', data: null };
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.videosService.publish(id);
    return { status: 'success', message: 'Video published', data };
  }
}
