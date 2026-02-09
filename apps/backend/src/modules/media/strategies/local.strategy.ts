import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageStrategy, UploadResult } from './storage.interface';

@Injectable()
export class LocalStorageStrategy implements StorageStrategy {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:4001');
  }

  async upload(file: Buffer, filename: string, mimetype: string): Promise<UploadResult> {
    // Create date-based subdirectory
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const subDir = path.join(year.toString(), month, day);
    const fullDir = path.join(this.uploadDir, subDir);

    // Ensure directory exists
    await fs.mkdir(fullDir, { recursive: true });

    // Write file
    const filePath = path.join(fullDir, filename);
    await fs.writeFile(filePath, file);

    // Get file stats
    const stats = await fs.stat(filePath);

    // Return relative path and URL
    const relativePath = path.join(subDir, filename);
    return {
      path: relativePath,
      url: this.getUrl(relativePath),
      size: stats.size,
    };
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  getUrl(filePath: string): string {
    return `${this.baseUrl}/uploads/${filePath.replace(/\\/g, '/')}`;
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
