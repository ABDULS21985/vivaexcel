import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageStrategy, UploadResult } from './storage.interface';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageStrategy implements StorageStrategy {
  private readonly bucket: string;
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly endpoint?: string;
  private readonly baseUrl: string;
  private readonly client: S3Client;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('B2_BUCKET_NAME') || this.configService.get<string>('S3_BUCKET', '');
    this.region = this.configService.get<string>('B2_REGION') || this.configService.get<string>('S3_REGION', 'us-east-1');
    this.accessKeyId = this.configService.get<string>('B2_KEY_ID') || this.configService.get<string>('S3_ACCESS_KEY_ID', '');
    this.secretAccessKey = this.configService.get<string>('B2_APP_KEY') || this.configService.get<string>('S3_SECRET_ACCESS_KEY', '');
    this.endpoint = this.configService.get<string>('B2_ENDPOINT') || this.configService.get<string>('S3_ENDPOINT');

    // For B2, public URL might need to be constructed differently or use a specific domain
    const initialBaseUrl = this.configService.get<string>(
      'S3_BASE_URL',
      this.endpoint
        ? `${this.endpoint}/${this.bucket}`
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com`,
    );
    this.baseUrl = initialBaseUrl;

    if (this.accessKeyId && this.secretAccessKey) {
      this.client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
        ...(this.endpoint && { endpoint: this.endpoint }),
        forcePathStyle: true, // Needed for many S3-compatible providers like MinIO/B2
      });
    } else {
      console.warn('S3/B2 credentials missing. S3StorageStrategy will fail.');
    }
  }

  async upload(file: Buffer, filename: string, mimetype: string): Promise<UploadResult> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const key = `${year}/${month}/${day}/${filename}`;

    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimetype,
      }));

      return {
        path: key,
        url: this.getUrl(key),
        size: file.length,
      };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      return true;
    } catch (error) {
      console.error('S3 Delete Error:', error);
      return false;
    }
  }

  getUrl(key: string): string {
    // Ensure no double slashes
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = key.startsWith('/') ? key.slice(1) : key;
    return `${base}/${path}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  }
}
