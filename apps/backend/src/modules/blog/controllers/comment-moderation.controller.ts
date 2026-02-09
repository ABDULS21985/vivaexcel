import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from '../services/comments.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Blog - Comment Moderation')
@Controller('blog/comments')
@UseGuards(RolesGuard, PermissionsGuard)
export class CommentModerationController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.COMMENT_MODERATE)
  @ApiOperation({ summary: 'Get all comments for moderation' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'search', required: false })
  @SwaggerResponse({ status: 200, description: 'Comments retrieved successfully' })
  async findAll(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
  ) {
    return this.commentsService.findAll({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
      search,
    });
  }
}
