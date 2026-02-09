import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageStrategy, UploadResult } from './storage.interface';
import B2 from 'backblaze-b2';

@Injectable()
export class B2StorageStrategy implements StorageStrategy {
    private readonly logger = new Logger(B2StorageStrategy.name);
    private readonly b2: B2;
    private readonly bucketName: string;
    private bucketId: string;
    private isConnected = false;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('B2_BUCKET_NAME', '');
        const applicationKeyId = this.configService.get<string>('B2_KEY_ID', '');
        const applicationKey = this.configService.get<string>('B2_APP_KEY', '');

        if (applicationKeyId && applicationKey) {
            this.b2 = new B2({
                applicationKeyId,
                applicationKey,
            });
        } else {
            this.logger.warn('B2 credentials missing. B2StorageStrategy will fail.');
        }
    }

    private async connect() {
        if (this.isConnected) return;

        try {
            await this.b2.authorize();
            const response = await this.b2.getBucket({ bucketName: this.bucketName });
            this.bucketId = response.data.buckets[0].bucketId;
            this.isConnected = true;
            this.logger.log('Successfully connected to Backblaze B2');
        } catch (error: any) {
            this.logger.error('Failed to connect to Backblaze B2:', error.message);
            throw new Error('Storage connection failed');
        }
    }

    async upload(file: Buffer, filename: string, mimetype: string): Promise<UploadResult> {
        await this.connect();

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const key = `${year}/${month}/${day}/${filename}`;

        try {
            const uploadUrlResponse = await this.b2.getUploadUrl({
                bucketId: this.bucketId,
            });

            const uploadResponse = await this.b2.uploadFile({
                uploadUrl: uploadUrlResponse.data.uploadUrl,
                uploadAuthToken: uploadUrlResponse.data.authorizationToken,
                fileName: key,
                data: file,
                mime: mimetype,
            });

            return {
                path: key,
                url: this.getUrl(key),
                size: file.length,
            };
        } catch (error: any) {
            this.logger.error('B2 Upload Error:', error.message);
            throw new Error('Failed to upload file to B2');
        }
    }

    async delete(key: string): Promise<boolean> {
        await this.connect();

        try {
            const listResponse = await this.b2.listFileNames({
                bucketId: this.bucketId,
                startFileName: key,
                maxFileCount: 1,
                delimiter: '',
                prefix: key,
            });

            const file = listResponse.data.files[0];
            if (file && file.fileName === key) {
                await this.b2.deleteFileVersion({
                    fileId: file.fileId,
                    fileName: key,
                });
                return true;
            }
            return false;
        } catch (error: any) {
            this.logger.error('B2 Delete Error:', error.message);
            return false;
        }
    }

    getUrl(key: string): string {
        const endpoint = this.configService.get<string>('B2_ENDPOINT');
        if (endpoint) {
            const base = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
            return `${base}/${key}`;
        }

        return `https://f000.backblazeb2.com/file/${this.bucketName}/${key}`;
    }

    async exists(key: string): Promise<boolean> {
        await this.connect();

        try {
            const listResponse = await this.b2.listFileNames({
                bucketId: this.bucketId,
                startFileName: key,
                maxFileCount: 1,
                delimiter: '',
                prefix: key,
            });

            const file = listResponse.data.files[0];
            return !!(file && file.fileName === key);
        } catch {
            return false;
        }
    }
}
