import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
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
import { Request } from 'express';
import { DownloadService } from '../services/download.service';
import { DeliveryQueryDto } from '../dto/delivery-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';

@Controller('downloads')
@ApiTags('Downloads & Delivery')
@UseGuards(RolesGuard, PermissionsGuard)
export class DeliveryController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('my-products')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List purchased products with download links' })
  @SwaggerResponse({ status: 200, description: 'User downloads retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  async getMyDownloads(
    @CurrentUser('sub') userId: string,
    @Query() query: DeliveryQueryDto,
  ) {
    return this.downloadService.getUserDownloads(userId, query.cursor, query.limit);
  }

  @Get('admin/analytics')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Download analytics' })
  @SwaggerResponse({ status: 200, description: 'Download analytics retrieved successfully' })
  async getAnalytics() {
    return this.downloadService.getDownloadAnalytics();
  }

  @Get('admin/suspicious')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Suspicious download patterns' })
  @SwaggerResponse({ status: 200, description: 'Suspicious download patterns retrieved' })
  async getSuspiciousDownloads() {
    return this.downloadService.getSuspiciousDownloads();
  }

  @Get(':token')
  @Public()
  @ApiOperation({ summary: 'Process download via token' })
  @ApiParam({ name: 'token', description: 'Download token' })
  @SwaggerResponse({ status: 200, description: 'Download processed, returns redirect URL' })
  @SwaggerResponse({ status: 400, description: 'Download link expired or exhausted' })
  @SwaggerResponse({ status: 404, description: 'Download link not found' })
  async processDownload(
    @Param('token') token: string,
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '0.0.0.0';
    const userAgent = req.headers['user-agent'] ?? 'unknown';

    return this.downloadService.processDownload(token, userId, ipAddress, userAgent);
  }

  @Post(':id/refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh expired download link' })
  @ApiParam({ name: 'id', description: 'Download link ID' })
  @SwaggerResponse({ status: 200, description: 'Download link refreshed successfully' })
  @SwaggerResponse({ status: 400, description: 'Cannot refresh link for refunded order' })
  @SwaggerResponse({ status: 404, description: 'Download link not found' })
  async refreshDownloadLink(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.downloadService.refreshDownloadLink(id, userId);
  }
}
