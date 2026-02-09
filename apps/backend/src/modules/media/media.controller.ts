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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { UploadMediaDto, UpdateMediaDto } from './dto/upload-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { MediaResponseDto, MediaListResponseDto } from './dto/media-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(RolesGuard, PermissionsGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.MEDIA_READ)
  @ApiOperation({ summary: 'Get all media files with pagination' })
  @SwaggerResponse({
    status: 200,
    description: 'Media files retrieved successfully',
    type: MediaListResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'folderId', required: false })
  async findAll(@Query() query: MediaQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Get('folders')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.MEDIA_READ)
  @ApiOperation({ summary: 'Get all media folders' })
  @SwaggerResponse({ status: 200, description: 'Folders retrieved successfully' })
  async findAllFolders() {
    return this.mediaService.findAllFolders();
  }

  @Post('folders')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.MEDIA_UPLOAD)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new media folder' })
  @SwaggerResponse({ status: 201, description: 'Folder created successfully' })
  @SwaggerResponse({ status: 409, description: 'Folder slug already exists' })
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.mediaService.createFolder(createFolderDto, userId);
  }

  @Get('folders/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.MEDIA_READ)
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @SwaggerResponse({ status: 200, description: 'Folder retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Folder not found' })
  async findFolderById(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.findFolderById(id);
  }

  @Delete('folders/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.MEDIA_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a media folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @SwaggerResponse({ status: 200, description: 'Folder deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Folder not found' })
  async removeFolder(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.removeFolder(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.MEDIA_READ)
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Media file retrieved successfully',
    type: MediaResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Media not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.findById(id);
  }

  @Post('upload')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.MEDIA_UPLOAD)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        alt: { type: 'string' },
        description: { type: 'string' },
        folderId: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['file'],
    },
  })
  @SwaggerResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: MediaResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid file' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.mediaService.upload(file, uploadMediaDto, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.MEDIA_UPDATE)
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Media updated successfully',
    type: MediaResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Media not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.MEDIA_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @SwaggerResponse({ status: 200, description: 'Media deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Media not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.remove(id);
  }
}
