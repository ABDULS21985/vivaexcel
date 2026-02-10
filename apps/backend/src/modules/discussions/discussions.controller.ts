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
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '../../common/constants/roles.constant';
import { DiscussionsService } from './discussions.service';
import {
  CreateThreadDto,
  UpdateThreadDto,
  CreateReplyDto,
  ThreadQueryDto,
  ModerateThreadDto,
} from './dto';

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  // ──────────────────────────────────────────────
  //  Categories
  // ──────────────────────────────────────────────

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all discussion categories' })
  @SwaggerResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories() {
    return this.discussionsService.getCategories();
  }

  // ──────────────────────────────────────────────
  //  Threads
  // ──────────────────────────────────────────────

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new discussion thread' })
  @SwaggerResponse({
    status: 201,
    description: 'Thread created successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 404, description: 'Category not found' })
  async createThread(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateThreadDto,
  ) {
    return this.discussionsService.createThread(userId, dto);
  }

  @Get('threads')
  @Public()
  @ApiOperation({ summary: 'Get paginated discussion threads' })
  @SwaggerResponse({
    status: 200,
    description: 'Threads retrieved successfully',
  })
  async getThreads(@Query() query: ThreadQueryDto) {
    return this.discussionsService.getThreads(query);
  }

  @Get('threads/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a single thread by slug or ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Thread retrieved successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Thread not found' })
  async getThread(@Param('slug') slug: string) {
    return this.discussionsService.getThread(slug);
  }

  @Patch('threads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a thread (author only)' })
  @SwaggerResponse({
    status: 200,
    description: 'Thread updated successfully',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Only the author can update this thread',
  })
  @SwaggerResponse({ status: 404, description: 'Thread not found' })
  async updateThread(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateThreadDto,
  ) {
    return this.discussionsService.updateThread(id, userId, dto);
  }

  @Delete('threads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a thread (author only, soft delete)' })
  @SwaggerResponse({
    status: 200,
    description: 'Thread deleted successfully',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Only the author can delete this thread',
  })
  @SwaggerResponse({ status: 404, description: 'Thread not found' })
  async deleteThread(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.discussionsService.deleteThread(id, userId);
  }

  // ──────────────────────────────────────────────
  //  Replies
  // ──────────────────────────────────────────────

  @Post('threads/:id/replies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a reply in a thread' })
  @SwaggerResponse({
    status: 201,
    description: 'Reply created successfully',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Thread is locked or invalid input',
  })
  @SwaggerResponse({ status: 404, description: 'Thread not found' })
  async createReply(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReplyDto,
  ) {
    return this.discussionsService.createReply(id, userId, dto);
  }

  // ──────────────────────────────────────────────
  //  Reply actions
  // ──────────────────────────────────────────────

  @Post('replies/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a reply' })
  @SwaggerResponse({
    status: 200,
    description: 'Like toggled successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Reply not found' })
  async toggleReplyLike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.discussionsService.toggleReplyLike(id, userId);
  }

  @Post('replies/:id/mark-answer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark a reply as the accepted answer (thread author only)',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Reply marked as answer successfully',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Only the thread author can mark an answer',
  })
  @SwaggerResponse({ status: 404, description: 'Reply not found' })
  async markAsAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.discussionsService.markAsAnswer(id, userId);
  }

  // ──────────────────────────────────────────────
  //  Moderation (admin only)
  // ──────────────────────────────────────────────

  @Patch('threads/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Moderate a thread (pin, lock, close) — admin only',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Thread moderated successfully',
  })
  @SwaggerResponse({ status: 403, description: 'Insufficient permissions' })
  @SwaggerResponse({ status: 404, description: 'Thread not found' })
  async moderateThread(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ModerateThreadDto,
  ) {
    return this.discussionsService.moderateThread(id, dto);
  }
}
