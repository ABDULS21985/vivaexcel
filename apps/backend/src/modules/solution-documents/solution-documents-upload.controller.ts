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
import { DocumentUploadService } from './processing/document-upload.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Solution Documents - Upload')
@ApiBearerAuth()
@Controller('solution-documents')
@UseGuards(RolesGuard, PermissionsGuard)
export class SolutionDocumentsUploadController {
  constructor(
    private readonly documentUploadService: DocumentUploadService,
  ) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a solution document file',
    description:
      'Upload a .docx, .pdf, .doc, or .md file. ' +
      'For .docx and .pdf files, metadata, headings, and text are automatically extracted. ' +
      'Maximum file size: 100MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The document file (.docx, .pdf, .doc, .md)',
        },
        digitalProductId: {
          type: 'string',
          format: 'uuid',
          description: 'The ID of the digital product this document belongs to',
        },
      },
      required: ['file', 'digitalProductId'],
    },
  })
  @SwaggerResponse({
    status: 201,
    description: 'Document uploaded and processed successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Invalid file or missing parameters' })
  @SwaggerResponse({ status: 413, description: 'File too large' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('digitalProductId') digitalProductId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.documentUploadService.processUpload(
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
    summary: 'Reprocess an existing document',
    description:
      'Re-extract metadata from the stored file. ' +
      'Only available for .docx and .pdf files.',
  })
  @ApiParam({ name: 'id', description: 'Solution Document ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Document reprocessed successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Cannot reprocess this file type' })
  @SwaggerResponse({ status: 404, description: 'Document or file not found' })
  async reprocess(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentUploadService.reprocessDocument(id);
  }

  @Delete(':id/files')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete all files for a solution document',
    description:
      'Removes the original document file from storage. ' +
      'Also soft-deletes the solution document record.',
  })
  @ApiParam({ name: 'id', description: 'Solution Document ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Document files deleted successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Document not found' })
  async deleteFiles(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentUploadService.deleteDocumentFiles(id);
  }
}
