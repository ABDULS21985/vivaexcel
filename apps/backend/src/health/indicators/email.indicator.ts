import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(EmailHealthIndicator.name);
  private readonly smtpHost: string;
  private readonly smtpPort: number;
  private readonly smtpSecure: boolean;
  private readonly smtpUser: string;
  private readonly smtpPass: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.smtpHost = this.configService.get<string>('SMTP_HOST', '');
    this.smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    this.smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';
    this.smtpUser = this.configService.get<string>('SMTP_USER', '');
    this.smtpPass = this.configService.get<string>('SMTP_PASS', '');
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.smtpHost) {
      const result = this.getStatus(key, false, {
        message: 'SMTP host not configured',
      });
      throw new HealthCheckError('Email health check failed', result);
    }

    let transport: nodemailer.Transporter | null = null;
    try {
      transport = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpSecure,
        auth:
          this.smtpUser && this.smtpPass
            ? { user: this.smtpUser, pass: this.smtpPass }
            : undefined,
        connectionTimeout: 5000,
      });

      await transport.verify();

      return this.getStatus(key, true, {
        host: this.smtpHost,
        port: this.smtpPort,
      });
    } catch (error) {
      this.logger.error(
        `Email health check failed: ${(error as Error).message}`,
      );
      const result = this.getStatus(key, false, {
        message: (error as Error).message,
        host: this.smtpHost,
      });
      throw new HealthCheckError('Email health check failed', result);
    } finally {
      if (transport) {
        transport.close();
      }
    }
  }
}
