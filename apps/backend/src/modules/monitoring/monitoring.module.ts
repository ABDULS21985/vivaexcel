import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceStatusEntity } from '../../entities/service-status.entity';
import { IncidentLog } from '../../entities/incident-log.entity';
import { AlertRule } from '../../entities/alert-rule.entity';
import { PerformanceBudget } from '../../entities/performance-budget.entity';
import { WebVitalReport } from '../../entities/web-vital-report.entity';
import { HealthModule } from '../../health/health.module';
import { AlertEvaluatorService } from './services/alert-evaluator.service';
import { AlertManagementService } from './services/alert-management.service';
import { HealthMonitorService } from './services/health-monitor.service';
import { DeploymentVerificationService } from './services/deployment-verification.service';
import { StatusController } from './controllers/status.controller';
import { IncidentsController } from './controllers/incidents.controller';
import { AlertsController } from './controllers/alerts.controller';
import { PerformanceController } from './controllers/performance.controller';
import { DeploymentController } from './controllers/deployment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceStatusEntity,
      IncidentLog,
      AlertRule,
      PerformanceBudget,
      WebVitalReport,
    ]),
    ScheduleModule,
    HealthModule,
  ],
  controllers: [
    StatusController,
    IncidentsController,
    AlertsController,
    PerformanceController,
    DeploymentController,
  ],
  providers: [
    AlertEvaluatorService,
    AlertManagementService,
    HealthMonitorService,
    DeploymentVerificationService,
  ],
  exports: [
    HealthMonitorService,
    DeploymentVerificationService,
  ],
})
export class MonitoringModule {}
