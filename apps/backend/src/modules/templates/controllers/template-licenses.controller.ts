import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TemplateLicensesService } from '../services/template-licenses.service';
import { CreateTemplateLicenseDto } from '../dto/create-template-license.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Template Licenses')
@Controller('template-licenses')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class TemplateLicensesController {
  constructor(private readonly licensesService: TemplateLicensesService) {}

  @Get('template/:templateId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get licenses for a template' })
  async findByTemplate(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.licensesService.findByTemplate(templateId);
  }

  @Get('my-licenses')
  @ApiOperation({ summary: 'Get current user licenses' })
  async findMyLicenses(@CurrentUser('id') userId: string) {
    return this.licensesService.findByUser(userId);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a license' })
  async create(@Body() dto: CreateTemplateLicenseDto) {
    return this.licensesService.create(dto);
  }

  @Post('validate/:licenseKey')
  @ApiOperation({ summary: 'Validate a license key' })
  async validate(@Param('licenseKey') licenseKey: string) {
    return this.licensesService.validate(licenseKey);
  }

  @Post('activate/:licenseKey')
  @ApiOperation({ summary: 'Activate a license' })
  async activate(@Param('licenseKey') licenseKey: string) {
    return this.licensesService.activate(licenseKey);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Deactivate a license' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.licensesService.deactivate(id);
  }
}
