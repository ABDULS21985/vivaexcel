import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as path from 'path';
import { StorageStrategy, STORAGE_STRATEGY } from '../media/strategies/storage.interface';
import { ApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class UploadService {
    constructor(
        @Inject(STORAGE_STRATEGY)
        private readonly storageStrategy: StorageStrategy,
    ) { }

    async uploadFile(file: Express.Multer.File): Promise<ApiResponse<{ url: string; path: string; size: number }>> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const ext = path.extname(file.originalname);
        const uniqueFilename = `${nanoid(16)}${ext}`;

        const uploadResult = await this.storageStrategy.upload(
            file.buffer,
            uniqueFilename,
            file.mimetype,
        );

        return {
            status: 'success',
            message: 'File uploaded successfully',
            data: {
                url: uploadResult.url,
                path: uploadResult.path,
                size: uploadResult.size,
            },
        };
    }
}
