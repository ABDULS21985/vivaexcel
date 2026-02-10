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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ShowcasesService } from './showcases.service';
import {
  CreateShowcaseDto,
  UpdateShowcaseDto,
  ShowcaseQueryDto,
  ShowcaseCommentDto,
  ModerateShowcaseDto,
  ShowcaseSortBy,
} from './dto/showcase.dto';
import { ShowcaseStatus } from './enums/showcase.enums';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/constants/roles.constant';

@ApiTags('Showcases')
@Controller('showcases')
@UseGuards(RolesGuard)
export class ShowcasesController {
  constructor(private readonly showcasesService: ShowcasesService) {}

  // ──────────────────────────────────────────────
  //  Create showcase
  // ──────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new showcase' })
  @SwaggerResponse({ status: 201, description: 'Showcase created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 403, description: 'User has not purchased the product' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateShowcaseDto,
  ) {
    return this.showcasesService.create(userId, dto);
  }

  // ──────────────────────────────────────────────
  //  List showcases (public)
  // ──────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'List showcases' })
  @SwaggerResponse({ status: 200, description: 'Showcases retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ShowcaseSortBy, description: 'Sort order' })
  @ApiQuery({ name: 'status', required: false, enum: ShowcaseStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  async findAll(@Query() query: ShowcaseQueryDto) {
    return this.showcasesService.findAll(query);
  }

  // ──────────────────────────────────────────────
  //  Get showcase detail (public)
  // ──────────────────────────────────────────────

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a showcase by ID' })
  @ApiParam({ name: 'id', description: 'Showcase ID' })
  @SwaggerResponse({ status: 200, description: 'Showcase retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Showcase not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.showcasesService.findOne(id);
  }

  // ──────────────────────────────────────────────
  //  Update showcase
  // ──────────────────────────────────────────────

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a showcase (owner only)' })
  @ApiParam({ name: 'id', description: 'Showcase ID' })
  @SwaggerResponse({ status: 200, description: 'Showcase updated successfully' })
  @SwaggerResponse({ status: 403, description: 'Only the owner can update this showcase' })
  @SwaggerResponse({ status: 404, description: 'Showcase not found' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShowcaseDto,
  ) {
    return this.showcasesService.update(id, userId, dto);
  }

  // ──────────────────────────────────────────────
  //  Delete showcase
  // ──────────────────────────────────────────────

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a showcase (owner only)' })
  @ApiParam({ name: 'id', description: 'Showcase ID' })
  @SwaggerResponse({ status: 200, description: 'Showcase deleted successfully' })
  @SwaggerResponse({ status: 403, description: 'Only the owner can delete this showcase' })
  @SwaggerResponse({ status: 404, description: 'Showcase not found' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.showcasesService.remove(id, userId);
  }

  // ──────────────────────────────────────────────
  //  Toggle like
  // ──────────────────────────────────────────────

  @Post(':id/like')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a showcase' })
  @ApiParam({ name: 'id', description: 'Showcase ID' })
  @SwaggerResponse({ status: 200, description: 'Like toggled successfully' })
  @SwaggerResponse({ status: 404, description: 'Showcase not found' })
  async toggleLike(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.showcasesService.toggleLike(id, userId);
  }

  // ──────────────────────────────────────────────
  //  Add comment
  // ──────────────────────────────────────────────

  @Post(':id/comments')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a showcase' })
  @ApiParam({ name: 'id', description: 'Showcase ID' })
  @SwaggerResponse({ status: 201, description: 'Comment added successfully' })
  @SwaggerResponse({ status: 404, description: 'Showcase not found' })
  async addComment(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShowcaseCommentDto,
  ) {
    return this.showcasesService.addComment(id, userId, dto);
  }

  // ──────────────────────────────────────────────
  //  List comments (public)
  // ──────────────────────────────────────────────

  @Get(':id/comments')
  @Public()
  @ApiOperation({ summary: 'Get comments for a showcase' })
  @ApiParam({ name: 'id', description: 'Showcase ID' })
  @SwaggerResponse({ status: 200, description: 'Comments retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Showcase not found' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async getComments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.showcasesService.getComments(id, page, limit);
  }

  // ──────────────────────────────────────────────
  //  Moderate showcase (admin)
  // ──────────────────────────────────────────────

  @Patch(':id/moderate')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Moderate a showcase (admin only)' })
  @ApiParam({ name: 'id', description: 'Showcase ID' })
  @SwaggerResponse({ status: 200, description: 'Showcase moderated successfully' })
  @SwaggerResponse({ status: 404, description: 'Showcase not found' })
  async moderate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ModerateShowcaseDto,
  ) {
    return this.showcasesService.moderate(id, dto.status);
  }
}
