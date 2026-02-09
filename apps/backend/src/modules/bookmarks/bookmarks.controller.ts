import {
  Controller,
  Get,
  Post,
  Delete,
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
import { BookmarksService } from './bookmarks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Bookmarks')
@Controller('bookmarks')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'List bookmarks for the current user' })
  @SwaggerResponse({
    status: 200,
    description: 'Bookmarks retrieved successfully',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: CursorPaginationDto,
  ) {
    return this.bookmarksService.findAllForUser(userId, query);
  }

  @Post(':postId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bookmark a post' })
  @ApiParam({ name: 'postId', description: 'Post ID to bookmark' })
  @SwaggerResponse({ status: 201, description: 'Post bookmarked successfully' })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  @SwaggerResponse({ status: 409, description: 'Post already bookmarked' })
  async create(
    @CurrentUser('sub') userId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.bookmarksService.create(userId, postId);
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a bookmark' })
  @ApiParam({ name: 'postId', description: 'Post ID to unbookmark' })
  @SwaggerResponse({ status: 200, description: 'Bookmark removed successfully' })
  @SwaggerResponse({ status: 404, description: 'Bookmark not found' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.bookmarksService.remove(userId, postId);
  }

  @Get(':postId/status')
  @ApiOperation({ summary: 'Check if a post is bookmarked' })
  @ApiParam({ name: 'postId', description: 'Post ID to check' })
  @SwaggerResponse({ status: 200, description: 'Bookmark status retrieved' })
  async isBookmarked(
    @CurrentUser('sub') userId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.bookmarksService.isBookmarked(userId, postId);
  }
}
