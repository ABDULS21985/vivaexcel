import {
  Controller,
  Get,
  Post,
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
import { RevisionsService } from '../services/revisions.service';
import { RevisionResponseDto, RevisionListResponseDto, RevisionDiffResponseDto } from '../dto/revision-response.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Blog - Post Revisions')
@Controller('blog/posts/:postId/revisions')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
@RequirePermissions(Permission.BLOG_UPDATE)
export class RevisionsController {
  constructor(private readonly revisionsService: RevisionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all revisions for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @SwaggerResponse({
    status: 200,
    description: 'Revisions retrieved successfully',
    type: RevisionListResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Post not found' })
  async getRevisions(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.revisionsService.getRevisions(postId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('diff')
  @ApiOperation({ summary: 'Compare two revisions' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'revision1', required: true, description: 'First revision ID' })
  @ApiQuery({ name: 'revision2', required: true, description: 'Second revision ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Diff computed successfully',
    type: RevisionDiffResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Revision not found' })
  @SwaggerResponse({ status: 400, description: 'Revisions belong to different posts' })
  async diffRevisions(
    @Param('postId', ParseUUIDPipe) _postId: string,
    @Query('revision1') revisionId1: string,
    @Query('revision2') revisionId2: string,
  ) {
    return this.revisionsService.diffRevisions(revisionId1, revisionId2);
  }

  @Get(':revisionId')
  @ApiOperation({ summary: 'Get a specific revision' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'revisionId', description: 'Revision ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Revision retrieved successfully',
    type: RevisionResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Revision not found' })
  async getRevision(
    @Param('postId', ParseUUIDPipe) _postId: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
  ) {
    return this.revisionsService.getRevision(revisionId);
  }

  @Post(':revisionId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a post to a previous revision' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'revisionId', description: 'Revision ID to restore' })
  @SwaggerResponse({
    status: 200,
    description: 'Post restored to revision successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Post or revision not found' })
  async restoreRevision(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.revisionsService.restoreRevision(postId, revisionId, userId);
  }
}
