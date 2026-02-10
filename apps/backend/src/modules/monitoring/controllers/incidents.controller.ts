import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IncidentLog,
  IncidentSeverity,
  IncidentStatus,
  IncidentTimelineEntry,
} from '../../../entities/incident-log.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';

@ApiTags('Monitoring - Incidents')
@ApiBearerAuth('JWT-auth')
@Controller('monitoring/incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class IncidentsController {
  constructor(
    @InjectRepository(IncidentLog)
    private readonly incidentRepo: Repository<IncidentLog>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all incidents' })
  async findAll(
    @Query('status') status?: IncidentStatus,
    @Query('severity') severity?: IncidentSeverity,
  ) {
    const qb = this.incidentRepo.createQueryBuilder('incident');

    if (status) {
      qb.andWhere('incident.status = :status', { status });
    }
    if (severity) {
      qb.andWhere('incident.severity = :severity', { severity });
    }

    const incidents = await qb
      .orderBy('incident.started_at', 'DESC')
      .getMany();

    return { status: 'success', data: incidents };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  async findOne(@Param('id') id: string) {
    const incident = await this.incidentRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    return { status: 'success', data: incident };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  async create(
    @Body()
    body: {
      title: string;
      description: string;
      severity: IncidentSeverity;
      servicesAffected: string[];
    },
  ) {
    const timelineEntry: IncidentTimelineEntry = {
      timestamp: new Date().toISOString(),
      update: body.description,
    };

    const incident = this.incidentRepo.create({
      title: body.title,
      description: body.description,
      severity: body.severity,
      servicesAffected: body.servicesAffected,
      status: IncidentStatus.INVESTIGATING,
      timeline: [timelineEntry],
      startedAt: new Date(),
    });

    const saved = await this.incidentRepo.save(incident);
    return {
      status: 'success',
      message: 'Incident created',
      data: saved,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update incident status and add timeline entry' })
  async update(
    @Param('id') id: string,
    @Body() body: { status: IncidentStatus; update: string },
  ) {
    const incident = await this.incidentRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');

    const timelineEntry: IncidentTimelineEntry = {
      timestamp: new Date().toISOString(),
      update: body.update,
    };

    incident.status = body.status;
    incident.timeline = [...incident.timeline, timelineEntry];

    const saved = await this.incidentRepo.save(incident);
    return {
      status: 'success',
      message: 'Incident updated',
      data: saved,
    };
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve an incident' })
  async resolve(@Param('id') id: string) {
    const incident = await this.incidentRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');

    const timelineEntry: IncidentTimelineEntry = {
      timestamp: new Date().toISOString(),
      update: 'Incident resolved',
    };

    incident.status = IncidentStatus.RESOLVED;
    incident.resolvedAt = new Date();
    incident.timeline = [...incident.timeline, timelineEntry];

    const saved = await this.incidentRepo.save(incident);
    return {
      status: 'success',
      message: 'Incident resolved',
      data: saved,
    };
  }

  @Post(':id/postmortem')
  @ApiOperation({ summary: 'Set postmortem URL for an incident' })
  async setPostmortem(
    @Param('id') id: string,
    @Body() body: { postmortemUrl: string },
  ) {
    const incident = await this.incidentRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');

    incident.postmortemUrl = body.postmortemUrl;
    const saved = await this.incidentRepo.save(incident);

    return {
      status: 'success',
      message: 'Postmortem URL set',
      data: saved,
    };
  }
}
