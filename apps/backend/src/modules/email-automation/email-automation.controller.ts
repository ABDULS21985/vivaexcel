import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EmailAutomationService } from './email-automation.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Email Automation')
@Controller('email-automation')
@UseGuards(RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class EmailAutomationController {
  constructor(
    private readonly emailAutomationService: EmailAutomationService,
  ) {}

  // ──────────────────────────────────────────────
  //  Admin: Sequence management
  // ──────────────────────────────────────────────

  @Get('sequences')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all email sequences (admin)' })
  async getSequences() {
    const sequences = await this.emailAutomationService.getSequences();
    return {
      status: 'success',
      message: 'Sequences retrieved successfully',
      data: sequences,
    };
  }

  @Get('sequences/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get email sequence by ID (admin)' })
  @ApiParam({ name: 'id', description: 'Sequence UUID' })
  async getSequenceById(@Param('id', ParseUUIDPipe) id: string) {
    const sequence = await this.emailAutomationService.getSequenceById(id);
    return {
      status: 'success',
      message: 'Sequence retrieved successfully',
      data: sequence,
    };
  }

  @Post('sequences')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new email sequence (admin)' })
  async createSequence(@Body() dto: CreateSequenceDto) {
    const sequence = await this.emailAutomationService.createSequence(dto);
    return {
      status: 'success',
      message: 'Sequence created successfully',
      data: sequence,
    };
  }

  @Patch('sequences/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update an email sequence (admin)' })
  @ApiParam({ name: 'id', description: 'Sequence UUID' })
  async updateSequence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSequenceDto,
  ) {
    const sequence = await this.emailAutomationService.updateSequence(id, dto);
    return {
      status: 'success',
      message: 'Sequence updated successfully',
      data: sequence,
    };
  }

  @Delete('sequences/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an email sequence (admin)' })
  @ApiParam({ name: 'id', description: 'Sequence UUID' })
  async deleteSequence(@Param('id', ParseUUIDPipe) id: string) {
    await this.emailAutomationService.deleteSequence(id);
    return {
      status: 'success',
      message: 'Sequence deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Admin: Enrollment management
  // ──────────────────────────────────────────────

  @Get('enrollments')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List enrollments with filters (admin)' })
  async getEnrollments(@Query() query: EnrollmentQueryDto) {
    const result = await this.emailAutomationService.getEnrollments(query);
    return {
      status: 'success',
      message: 'Enrollments retrieved successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      },
    };
  }

  @Post('enrollments/:id/cancel')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an enrollment (admin)' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  async cancelEnrollment(@Param('id', ParseUUIDPipe) id: string) {
    const enrollment =
      await this.emailAutomationService.cancelEnrollmentById(id);
    return {
      status: 'success',
      message: 'Enrollment canceled successfully',
      data: enrollment,
    };
  }

  // ──────────────────────────────────────────────
  //  User: Own enrollments
  // ──────────────────────────────────────────────

  @Get('my-enrollments')
  @ApiOperation({ summary: "Get current user's email sequence enrollments" })
  async getMyEnrollments(@CurrentUser('sub') userId: string) {
    const enrollments =
      await this.emailAutomationService.getUserEnrollments(userId);
    return {
      status: 'success',
      message: 'Enrollments retrieved successfully',
      data: enrollments,
    };
  }

  @Post('my-enrollments/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel own enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  async cancelMyEnrollment(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const enrollment =
      await this.emailAutomationService.cancelUserEnrollmentById(userId, id);
    return {
      status: 'success',
      message: 'Enrollment canceled successfully',
      data: enrollment,
    };
  }
}
