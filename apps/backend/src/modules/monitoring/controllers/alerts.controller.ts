import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertManagementService } from '../services/alert-management.service';
import { AlertRule } from '../../../entities/alert-rule.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { EmailService } from '../../email/email.service';

@ApiTags('Monitoring - Alerts')
@ApiBearerAuth('JWT-auth')
@Controller('monitoring/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AlertsController {
  constructor(
    private readonly alertService: AlertManagementService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all alert rules' })
  async findAll() {
    const rules = await this.alertService.findAll();
    return { status: 'success', data: rules };
  }

  @Get('active')
  @ApiOperation({ summary: 'List currently triggered alerts' })
  async getActive() {
    const alerts = await this.alertService.getActiveAlerts();
    return { status: 'success', data: alerts };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new alert rule' })
  async create(@Body() body: Partial<AlertRule>) {
    const rule = await this.alertService.create(body);
    return {
      status: 'success',
      message: 'Alert rule created',
      data: rule,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an alert rule' })
  async update(@Param('id') id: string, @Body() body: Partial<AlertRule>) {
    const rule = await this.alertService.update(id, body);
    if (!rule) throw new NotFoundException('Alert rule not found');
    return {
      status: 'success',
      message: 'Alert rule updated',
      data: rule,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert rule' })
  async remove(@Param('id') id: string) {
    await this.alertService.remove(id);
    return { status: 'success', message: 'Alert rule deleted' };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Fire a test alert notification' })
  async testAlert(@Param('id') id: string) {
    const rule = await this.alertService.findOne(id);
    if (!rule) throw new NotFoundException('Alert rule not found');

    // Send test notification without updating lastTriggeredAt
    for (const recipient of rule.recipients) {
      await this.emailService.sendNotification(
        recipient,
        `[TEST Alert] ${rule.name}`,
        `<h2>Test Alert: ${rule.name}</h2>
        <p>This is a test notification for alert rule "${rule.name}".</p>
        <p><strong>Metric:</strong> ${rule.metric}</p>
        <p><strong>Threshold:</strong> ${rule.condition} ${rule.threshold}</p>`,
      );
    }

    return { status: 'success', message: 'Test alert sent' };
  }
}
