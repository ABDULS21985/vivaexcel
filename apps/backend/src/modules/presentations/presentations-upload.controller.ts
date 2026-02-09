import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
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
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PresentationUploadService } from './processing/presentation-upload.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Presentations - Upload')
@ApiBearerAuth()
@Controller('presentations')
@UseGuards(RolesGuard, PermissionsGuard)
export class PresentationsUploadController {
  constructor(
    private readonly presentationUploadService: PresentationUploadService,
  ) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a presentation file',
    description:
      'Upload a .pptx, .ppt, .key, .odp, or .pdf file. ' +
      'For .pptx files, metadata, slide info, and thumbnails are automatically extracted. ' +
      'Maximum file size: 200MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The presentation file (.pptx, .ppt, .key, .odp, .pdf)',
        },
        digitalProductId: {
          type: 'string',
          format: 'uuid',
          description: 'The ID of the digital product this presentation belongs to',
        },
      },
      required: ['file', 'digitalProductId'],
    },
  })
  @SwaggerResponse({
    status: 201,
    description: 'Presentation uploaded and processed successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Invalid file or missing parameters' })
  @SwaggerResponse({ status: 413, description: 'File too large' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('digitalProductId') digitalProductId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.presentationUploadService.processUpload(
      file,
      digitalProductId,
      userId,
    );
  }

  @Post(':id/reprocess')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reprocess an existing presentation',
    description:
      'Re-extract metadata and regenerate thumbnails from the stored file. ' +
      'Only available for .pptx files.',
  })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Presentation reprocessed successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Cannot reprocess this file type' })
  @SwaggerResponse({ status: 404, description: 'Presentation or file not found' })
  async reprocess(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationUploadService.reprocessPresentation(id);
  }

  @Delete(':id/files')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete all files for a presentation',
    description:
      'Removes the original presentation file, all thumbnails, and previews from storage. ' +
      'Also soft-deletes the presentation record and its slide preview records.',
  })
  @ApiParam({ name: 'id', description: 'Presentation ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Presentation files deleted successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Presentation not found' })
  async deleteFiles(@Param('id', ParseUUIDPipe) id: string) {
    return this.presentationUploadService.deletePresentation(id);
  }
}
