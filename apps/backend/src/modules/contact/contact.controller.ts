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
  Req,
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
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { ContactResponseDto, ContactListResponseDto } from './dto/contact-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Contact')
@Controller('contact')
@UseGuards(RolesGuard, PermissionsGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.CONTACT_READ)
  @ApiOperation({ summary: 'Get all contact submissions (admin only)' })
  @SwaggerResponse({
    status: 200,
    description: 'Contact submissions retrieved successfully',
    type: ContactListResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query() query: ContactQueryDto) {
    return this.contactService.findAll(query);
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.CONTACT_READ)
  @ApiOperation({ summary: 'Get contact submission statistics' })
  @SwaggerResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats() {
    return this.contactService.getStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.CONTACT_READ)
  @ApiOperation({ summary: 'Get contact submission by ID' })
  @ApiParam({ name: 'id', description: 'Contact submission ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Contact submission retrieved successfully',
    type: ContactResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Contact submission not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.findById(id);
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit contact form (public)' })
  @SwaggerResponse({
    status: 201,
    description: 'Contact form submitted successfully',
    type: ContactResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createContactDto: CreateContactDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.contactService.create(createContactDto, ipAddress, userAgent);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.CONTACT_UPDATE)
  @ApiOperation({ summary: 'Update contact submission status' })
  @ApiParam({ name: 'id', description: 'Contact submission ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Contact status updated successfully',
    type: ContactResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Contact submission not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateContactStatusDto,
  ) {
    return this.contactService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.CONTACT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete contact submission' })
  @ApiParam({ name: 'id', description: 'Contact submission ID' })
  @SwaggerResponse({ status: 200, description: 'Contact submission deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Contact submission not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.remove(id);
  }
}
