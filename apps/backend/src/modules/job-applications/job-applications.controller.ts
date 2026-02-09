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
  Req,
} from '@nestjs/common';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationQueryDto } from './dto/job-application-query.dto';
import { UpdateApplicationStatusDto, UpdateApplicationNotesDto } from './dto/update-application-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';

@ApiTags('Job Applications')
@Controller('job-applications')
@UseGuards(RolesGuard, PermissionsGuard)
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('resume'))
  @ApiOperation({ summary: 'Submit a job application (public)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'positionId', 'positionTitle', 'department', 'resume'],
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        phone: { type: 'string', example: '+1234567890' },
        positionId: { type: 'string', example: 'senior-fullstack-engineer' },
        positionTitle: { type: 'string', example: 'Senior Full Stack Engineer' },
        department: { type: 'string', example: 'Engineering' },
        location: { type: 'string', example: 'Lagos, Nigeria' },
        coverLetter: { type: 'string', example: 'I am excited to apply for this position...' },
        linkedinUrl: { type: 'string', example: 'https://linkedin.com/in/johndoe' },
        portfolioUrl: { type: 'string', example: 'https://johndoe.com' },
        resume: { type: 'string', format: 'binary' },
      },
    },
  })
  @SwaggerResponse({
    status: 201,
    description: 'Job application submitted successfully',
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input or missing resume' })
  async create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @UploadedFile() resume: Express.Multer.File,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.jobApplicationsService.create(
      createJobApplicationDto,
      resume,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.APPLICATION_READ)
  @ApiOperation({ summary: 'Get all job applications (admin only)' })
  @SwaggerResponse({
    status: 200,
    description: 'Job applications retrieved successfully',
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'positionId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  async findAll(@Query() query: JobApplicationQueryDto) {
    return this.jobApplicationsService.findAll(query);
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.APPLICATION_READ)
  @ApiOperation({ summary: 'Get job application statistics' })
  @SwaggerResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats() {
    return this.jobApplicationsService.getStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.APPLICATION_READ)
  @ApiOperation({ summary: 'Get job application by ID' })
  @ApiParam({ name: 'id', description: 'Job application ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Job application retrieved successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Job application not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobApplicationsService.findById(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.APPLICATION_UPDATE)
  @ApiOperation({ summary: 'Update job application status' })
  @ApiParam({ name: 'id', description: 'Job application ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Job application status updated successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Job application not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.jobApplicationsService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/notes')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.APPLICATION_UPDATE)
  @ApiOperation({ summary: 'Update job application notes' })
  @ApiParam({ name: 'id', description: 'Job application ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Job application notes updated successfully',
  })
  @SwaggerResponse({ status: 404, description: 'Job application not found' })
  async updateNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotesDto: UpdateApplicationNotesDto,
  ) {
    return this.jobApplicationsService.updateNotes(id, updateNotesDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.APPLICATION_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete job application' })
  @ApiParam({ name: 'id', description: 'Job application ID' })
  @SwaggerResponse({ status: 200, description: 'Job application deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Job application not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobApplicationsService.remove(id);
  }
}
