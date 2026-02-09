import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
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
import { LicenseService } from '../services/license.service';
import { ActivateLicenseDto } from '../dto/activate-license.dto';
import { RevokeLicenseDto } from '../dto/revoke-license.dto';
import { DeliveryQueryDto } from '../dto/delivery-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';

@Controller('licenses')
@ApiTags('Licenses')
@UseGuards(RolesGuard, PermissionsGuard)
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('validate')
  @Public()
  @ApiOperation({ summary: 'Validate license key' })
  @ApiQuery({ name: 'key', required: true, description: 'License key to validate' })
  @ApiQuery({ name: 'domain', required: false, description: 'Domain to validate against' })
  @SwaggerResponse({ status: 200, description: 'License validation result' })
  async validateLicense(
    @Query('key') key: string,
    @Query('domain') domain?: string,
  ) {
    return this.licenseService.validateLicense(key, domain);
  }

  @Get('my-licenses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user licenses' })
  @SwaggerResponse({ status: 200, description: 'User licenses retrieved successfully' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  async getMyLicenses(
    @CurrentUser('sub') userId: string,
    @Query() query: DeliveryQueryDto,
  ) {
    return this.licenseService.getUserLicenses(userId, query.cursor, query.limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get license details' })
  @ApiParam({ name: 'id', description: 'License ID' })
  @SwaggerResponse({ status: 200, description: 'License details retrieved successfully' })
  @SwaggerResponse({ status: 403, description: 'Access denied' })
  @SwaggerResponse({ status: 404, description: 'License not found' })
  async getLicenseDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.licenseService.getLicenseDetails(id, userId);
  }

  @Post(':id/activate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate license on domain/machine' })
  @ApiParam({ name: 'id', description: 'License ID' })
  @SwaggerResponse({ status: 200, description: 'License activated successfully' })
  @SwaggerResponse({ status: 400, description: 'License not active or max activations reached' })
  @SwaggerResponse({ status: 404, description: 'License not found' })
  @SwaggerResponse({ status: 409, description: 'License already activated for this domain' })
  async activateLicense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActivateLicenseDto,
    @Req() req: Request,
  ) {
    // Look up the license by ID to get the license key
    const licenseDetails = await this.licenseService.getLicenseDetails(
      id,
      (req as any).user?.sub,
    );
    const licenseKey = licenseDetails.data?.licenseKey;

    if (!licenseKey) {
      return {
        status: 'error',
        message: 'License not found',
      };
    }

    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '0.0.0.0';

    return this.licenseService.activateLicense(
      licenseKey,
      body.domain,
      body.machineId,
      ipAddress,
    );
  }

  @Delete(':id/activations/:activationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate license activation' })
  @ApiParam({ name: 'id', description: 'License ID' })
  @ApiParam({ name: 'activationId', description: 'Activation ID' })
  @SwaggerResponse({ status: 200, description: 'License activation deactivated' })
  @SwaggerResponse({ status: 400, description: 'Activation already deactivated' })
  @SwaggerResponse({ status: 403, description: 'Access denied' })
  @SwaggerResponse({ status: 404, description: 'License or activation not found' })
  async deactivateLicense(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('activationId', ParseUUIDPipe) activationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    // Look up the license by ID to get the license key
    const licenseDetails = await this.licenseService.getLicenseDetails(id, userId);
    const licenseKey = licenseDetails.data?.licenseKey;

    if (!licenseKey) {
      return {
        status: 'error',
        message: 'License not found',
      };
    }

    return this.licenseService.deactivateLicense(licenseKey, activationId, userId);
  }

  @Post(':id/revoke')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Revoke license (admin)' })
  @ApiParam({ name: 'id', description: 'License ID' })
  @SwaggerResponse({ status: 200, description: 'License revoked successfully' })
  @SwaggerResponse({ status: 400, description: 'License already revoked' })
  @SwaggerResponse({ status: 404, description: 'License not found' })
  async revokeLicense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RevokeLicenseDto,
  ) {
    // Look up the license by ID to get the license key
    // Admin can view any license, so we pass a dummy check via repository directly
    const license = await this.licenseService.getLicenseDetails(id, '').catch(async () => {
      // If ForbiddenException, admin still needs access — try direct approach
      return null;
    });

    // For admin, we need to find the license key differently since they may not own it
    // We'll use the repository through the service's internal method
    // Workaround: use the validate endpoint pattern
    // Since this is admin-only, we retrieve the license key via a direct query pattern
    // The service will handle finding by key
    return this.licenseService.revokeLicense(id, body.reason);
  }
}
