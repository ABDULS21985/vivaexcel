import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(StorageHealthIndicator.name);
  private s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.bucketName =
      this.configService.get<string>('B2_BUCKET_NAME') ||
      this.configService.get<string>('S3_BUCKET', '');
    this.region =
      this.configService.get<string>('B2_REGION') ||
      this.configService.get<string>('S3_REGION', 'us-east-1');

    const accessKeyId =
      this.configService.get<string>('B2_KEY_ID') ||
      this.configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey =
      this.configService.get<string>('B2_APP_KEY') ||
      this.configService.get<string>('S3_SECRET_KEY');
    const endpoint =
      this.configService.get<string>('B2_ENDPOINT') ||
      this.configService.get<string>('S3_ENDPOINT');

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: { accessKeyId, secretAccessKey },
        ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      });
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.s3Client || !this.bucketName) {
      const result = this.getStatus(key, false, {
        message: 'Storage credentials not configured',
      });
      throw new HealthCheckError('Storage health check failed', result);
    }

    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );

      return this.getStatus(key, true, {
        bucket: this.bucketName,
        region: this.region,
      });
    } catch (error) {
      this.logger.error(
        `Storage health check failed: ${(error as Error).message}`,
      );
      const result = this.getStatus(key, false, {
        message: (error as Error).message,
      });
      throw new HealthCheckError('Storage health check failed', result);
    }
  }
}
