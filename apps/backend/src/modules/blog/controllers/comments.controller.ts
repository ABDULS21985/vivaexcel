import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Blog - Comments')
@Controller('blog/posts/:postId/comments')
@UseGuards(RolesGuard, PermissionsGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @SwaggerResponse({ status: 200, description: 'Comments retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async findAll(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPostId(postId);
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @SwaggerResponse({ status: 201, description: 'Comment created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('sub') authorId: string | undefined,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.commentsService.create(
      postId,
      createCommentDto,
      authorId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':id/approve')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.COMMENT_MODERATE)
  @ApiOperation({ summary: 'Approve a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @SwaggerResponse({ status: 200, description: 'Comment approved successfully' })
  @SwaggerResponse({ status: 404, description: 'Comment not found' })
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.approve(id);
  }

  @Post(':id/reject')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.COMMENT_MODERATE)
  @ApiOperation({ summary: 'Reject a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @SwaggerResponse({ status: 200, description: 'Comment rejected successfully' })
  @SwaggerResponse({ status: 404, description: 'Comment not found' })
  async reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.reject(id);
  }

  @Post(':id/spam')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.COMMENT_MODERATE)
  @ApiOperation({ summary: 'Mark a comment as spam' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @SwaggerResponse({ status: 200, description: 'Comment marked as spam' })
  @SwaggerResponse({ status: 404, description: 'Comment not found' })
  async markAsSpam(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.markAsSpam(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.COMMENT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @SwaggerResponse({ status: 200, description: 'Comment deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.remove(id);
  }
}
