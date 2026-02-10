import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  AlertRule,
  AlertCondition,
  AlertChannel,
} from '../../../entities/alert-rule.entity';

@Injectable()
export class AlertManagementService implements OnModuleInit {
  private readonly logger = new Logger(AlertManagementService.name);

  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepo: Repository<AlertRule>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultRules();
  }

  async findAll(): Promise<AlertRule[]> {
    return this.alertRuleRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<AlertRule | null> {
    return this.alertRuleRepo.findOne({ where: { id } });
  }

  async create(data: Partial<AlertRule>): Promise<AlertRule> {
    const rule = this.alertRuleRepo.create(data);
    return this.alertRuleRepo.save(rule);
  }

  async update(id: string, data: Partial<AlertRule>): Promise<AlertRule | null> {
    await this.alertRuleRepo.update(id, data);
    return this.alertRuleRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.alertRuleRepo.softDelete(id);
  }

  async getActiveAlerts(): Promise<AlertRule[]> {
    const rules = await this.alertRuleRepo.find({
      where: { isActive: true },
    });

    return rules.filter((rule) => {
      if (!rule.lastTriggeredAt) return false;
      const cooldownMs = rule.cooldownMinutes * 60 * 1000;
      const elapsed = Date.now() - new Date(rule.lastTriggeredAt).getTime();
      return elapsed < cooldownMs;
    });
  }

  private async seedDefaultRules(): Promise<void> {
    const recipientsStr = this.configService.get<string>(
      'ALERT_EMAIL_RECIPIENTS',
      'admin@drkatangablog.com',
    );
    const recipients = recipientsStr.split(',').map((r) => r.trim());

    const defaults: Array<Partial<AlertRule>> = [
      {
        name: 'High Error Rate',
        description: 'API error rate exceeds 5% of requests',
        metric: 'api_errors_total',
        condition: AlertCondition.GT,
        threshold: 0.05,
        duration: 120,
        channel: AlertChannel.EMAIL,
        recipients,
        cooldownMinutes: 30,
      },
      {
        name: 'High P99 Latency',
        description: 'P99 request latency exceeds 5 seconds',
        metric: 'http_request_duration_seconds',
        condition: AlertCondition.GT,
        threshold: 5.0,
        duration: 180,
        channel: AlertChannel.EMAIL,
        recipients,
        cooldownMinutes: 30,
      },
      {
        name: 'Health Check Failure',
        description: 'A health check is returning DOWN status',
        metric: 'health_check_status',
        condition: AlertCondition.EQ,
        threshold: 0,
        duration: 60,
        channel: AlertChannel.EMAIL,
        recipients,
        cooldownMinutes: 15,
      },
      {
        name: 'High Memory Usage',
        description: 'Node.js heap usage exceeds 500MB',
        metric: 'nodejs_heap_used_bytes',
        condition: AlertCondition.GT,
        threshold: 500000000,
        duration: 300,
        channel: AlertChannel.EMAIL,
        recipients,
        cooldownMinutes: 60,
      },
      {
        name: 'Redis Connection Lost',
        description: 'Redis health check is failing',
        metric: 'health_check_status',
        condition: AlertCondition.EQ,
        threshold: 0,
        duration: 30,
        channel: AlertChannel.EMAIL,
        recipients,
        cooldownMinutes: 15,
      },
    ];

    for (const rule of defaults) {
      const existing = await this.alertRuleRepo.findOne({
        where: { name: rule.name! },
      });
      if (!existing) {
        await this.alertRuleRepo.save(this.alertRuleRepo.create(rule));
        this.logger.log(`Seeded default alert rule: ${rule.name}`);
      }
    }
  }
}
