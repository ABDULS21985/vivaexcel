import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Public } from '../../../common/decorators/public.decorator';
import { ServiceStatusEntity } from '../../../entities/service-status.entity';
import { IncidentLog, IncidentStatus } from '../../../entities/incident-log.entity';

@ApiTags('Status')
@Controller('status')
export class StatusController {
  constructor(
    @InjectRepository(ServiceStatusEntity)
    private readonly serviceStatusRepo: Repository<ServiceStatusEntity>,
    @InjectRepository(IncidentLog)
    private readonly incidentLogRepo: Repository<IncidentLog>,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get current system status' })
  async getStatus() {
    const services = await this.serviceStatusRepo.find({
      order: { serviceName: 'ASC' },
    });

    const activeIncidents = await this.incidentLogRepo.find({
      where: { status: Not(IncidentStatus.RESOLVED) },
      order: { startedAt: 'DESC' },
    });

    return {
      status: 'success',
      data: { services, activeIncidents },
    };
  }

  @Get('history')
  @Public()
  @ApiOperation({ summary: 'Get incident history (last 90 days)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [incidents, total] = await this.incidentLogRepo
      .createQueryBuilder('incident')
      .where('incident.started_at >= :since', { since: ninetyDaysAgo })
      .orderBy('incident.started_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      status: 'success',
      data: incidents,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Get('uptime')
  @Public()
  @ApiOperation({ summary: 'Get per-service uptime percentages' })
  async getUptime() {
    const services = await this.serviceStatusRepo.find({
      select: ['serviceName', 'displayName', 'uptimePercentage', 'status'],
      order: { serviceName: 'ASC' },
    });

    return {
      status: 'success',
      data: services.map((s) => ({
        serviceName: s.serviceName,
        displayName: s.displayName,
        uptimePercentage: s.uptimePercentage,
        currentStatus: s.status,
      })),
    };
  }
}
