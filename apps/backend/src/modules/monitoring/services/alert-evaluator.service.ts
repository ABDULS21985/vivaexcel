import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AlertRule, AlertCondition } from '../../../entities/alert-rule.entity';
import { MetricsService } from '../../../metrics/metrics.service';
import { EmailService } from '../../email/email.service';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class AlertEvaluatorService {
  private readonly logger = new Logger(AlertEvaluatorService.name);

  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepo: Repository<AlertRule>,
    private readonly metricsService: MetricsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  @Cron('*/60 * * * * *')
  async evaluateAlerts(): Promise<void> {
    try {
      const rules = await this.alertRuleRepo.find({
        where: { isActive: true },
      });

      for (const rule of rules) {
        try {
          await this.evaluateRule(rule);
        } catch (error) {
          this.logger.error(
            `Error evaluating alert rule "${rule.name}": ${(error as Error).message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in alert evaluation cycle: ${(error as Error).message}`);
    }
  }

  private async evaluateRule(rule: AlertRule): Promise<void> {
    const currentValue = await this.getMetricValue(rule);
    if (currentValue === null) return;

    // Update last value
    await this.alertRuleRepo.update(rule.id, { lastValue: currentValue });

    const conditionMet = this.checkCondition(
      currentValue,
      rule.condition,
      Number(rule.threshold),
    );

    if (!conditionMet) return;

    // Check cooldown
    if (rule.lastTriggeredAt) {
      const cooldownMs = rule.cooldownMinutes * 60 * 1000;
      const elapsed = Date.now() - new Date(rule.lastTriggeredAt).getTime();
      if (elapsed < cooldownMs) return;
    }

    // Trigger alert
    this.logger.warn(
      `Alert triggered: "${rule.name}" - ${rule.metric} = ${currentValue} (threshold: ${rule.threshold})`,
    );

    await this.alertRuleRepo.update(rule.id, {
      lastTriggeredAt: new Date(),
      triggerCount: () => 'trigger_count + 1',
    });

    await this.sendNotification(rule, currentValue);
  }

  private async getMetricValue(rule: AlertRule): Promise<number | null> {
    const registry = this.metricsService.getRegistry();
    const metric = await registry.getSingleMetric(rule.metric);
    if (!metric) return null;

    const metricData = await metric.get();

    // Handle gauge - use current value
    if (metricData.type === 'gauge') {
      const values = metricData.values;
      if (values.length === 0) return null;
      return values[0].value;
    }

    // Handle counter - compute rate using Redis rolling window
    if (metricData.type === 'counter') {
      const values = metricData.values;
      if (values.length === 0) return null;
      const totalValue = values.reduce((sum, v) => sum + v.value, 0);
      return await this.computeRate(rule.id, totalValue, rule.duration);
    }

    // Handle histogram - extract p99
    if (metricData.type === 'histogram') {
      const p99 = metricData.values.find(
        (v) => v.labels && (v.labels as Record<string, string>).quantile === '0.99',
      );
      if (p99) return p99.value;
      // Fallback: return sum/count for average
      const sum = metricData.values.find(
        (v) => v.metricName?.endsWith('_sum'),
      );
      const count = metricData.values.find(
        (v) => v.metricName?.endsWith('_count'),
      );
      if (sum && count && count.value > 0) {
        return sum.value / count.value;
      }
      return null;
    }

    return null;
  }

  private async computeRate(
    ruleId: string,
    currentValue: number,
    windowSeconds: number,
  ): Promise<number> {
    const key = `alert-metric:${ruleId}`;
    const now = Date.now();
    const entry = JSON.stringify({ timestamp: now, value: currentValue });

    try {
      // Add current data point
      await this.redisService.getClient().zadd(key, now.toString(), entry);

      // Remove old entries outside the window
      const cutoff = now - windowSeconds * 1000;
      await this.redisService.getClient().zremrangebyscore(key, '-inf', cutoff.toString());

      // Set TTL on the key
      await this.redisService.expire(key, windowSeconds * 2);

      // Get oldest entry in window
      const oldest = await this.redisService.getClient().zrange(key, 0, 0);
      if (!oldest || oldest.length === 0) return 0;

      const oldestEntry = JSON.parse(oldest[0]);
      const timeDiff = (now - oldestEntry.timestamp) / 1000;
      if (timeDiff <= 0) return 0;

      return (currentValue - oldestEntry.value) / timeDiff;
    } catch {
      return 0;
    }
  }

  private checkCondition(
    value: number,
    condition: AlertCondition,
    threshold: number,
  ): boolean {
    switch (condition) {
      case AlertCondition.GT:
        return value > threshold;
      case AlertCondition.LT:
        return value < threshold;
      case AlertCondition.EQ:
        return value === threshold;
      case AlertCondition.GTE:
        return value >= threshold;
      case AlertCondition.LTE:
        return value <= threshold;
      default:
        return false;
    }
  }

  private async sendNotification(
    rule: AlertRule,
    currentValue: number,
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    switch (rule.channel) {
      case 'EMAIL':
        for (const recipient of rule.recipients) {
          await this.emailService.sendNotification(
            recipient,
            `[Alert] ${rule.name}`,
            `<h2>Alert: ${rule.name}</h2>
            <p><strong>Metric:</strong> ${rule.metric}</p>
            <p><strong>Current Value:</strong> ${currentValue}</p>
            <p><strong>Threshold:</strong> ${rule.condition} ${rule.threshold}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p>${rule.description || ''}</p>`,
          );
        }
        break;

      case 'WEBHOOK':
        for (const url of rule.recipients) {
          try {
            await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                alertName: rule.name,
                metric: rule.metric,
                currentValue,
                threshold: rule.threshold,
                condition: rule.condition,
                timestamp,
              }),
            });
          } catch (error) {
            this.logger.error(`Failed to send webhook to ${url}: ${(error as Error).message}`);
          }
        }
        break;

      case 'SLACK':
        const slackWebhookUrl =
          rule.recipients[0] ||
          this.configService.get<string>('SLACK_WEBHOOK_URL');
        if (slackWebhookUrl) {
          try {
            await fetch(slackWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                blocks: [
                  {
                    type: 'header',
                    text: { type: 'plain_text', text: `Alert: ${rule.name}` },
                  },
                  {
                    type: 'section',
                    fields: [
                      { type: 'mrkdwn', text: `*Metric:*\n${rule.metric}` },
                      { type: 'mrkdwn', text: `*Value:*\n${currentValue}` },
                      { type: 'mrkdwn', text: `*Threshold:*\n${rule.condition} ${rule.threshold}` },
                      { type: 'mrkdwn', text: `*Time:*\n${timestamp}` },
                    ],
                  },
                ],
              }),
            });
          } catch (error) {
            this.logger.error(`Failed to send Slack notification: ${(error as Error).message}`);
          }
        }
        break;
    }
  }
}
