import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
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
import { ReadingHistoryService } from './reading-history.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Reading History')
@Controller('reading-history')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ReadingHistoryController {
  constructor(
    private readonly readingHistoryService: ReadingHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List reading history for the current user' })
  @SwaggerResponse({
    status: 200,
    description: 'Reading history retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.readingHistoryService.findAllForUser(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get reading statistics for the current user' })
  @SwaggerResponse({
    status: 200,
    description: 'Reading stats retrieved successfully',
  })
  async getStats(@CurrentUser('sub') userId: string) {
    return this.readingHistoryService.getStats(userId);
  }

  @Post(':postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track reading progress for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID to track' })
  @SwaggerResponse({ status: 200, description: 'Reading progress tracked' })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async trackRead(
    @CurrentUser('sub') userId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() body: { progress?: number },
  ) {
    return this.readingHistoryService.trackRead(
      userId,
      postId,
      body?.progress ?? 100,
    );
  }

  @Delete(':entryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a single reading history entry' })
  @ApiParam({ name: 'entryId', description: 'Entry ID to remove' })
  @SwaggerResponse({ status: 200, description: 'Entry removed' })
  @SwaggerResponse({ status: 404, description: 'Entry not found' })
  async removeEntry(
    @CurrentUser('sub') userId: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
  ) {
    return this.readingHistoryService.removeEntry(userId, entryId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all reading history for the current user' })
  @SwaggerResponse({ status: 200, description: 'Reading history cleared' })
  async clearAll(@CurrentUser('sub') userId: string) {
    return this.readingHistoryService.clearAll(userId);
  }
}
