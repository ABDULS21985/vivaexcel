import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { Media } from '../../entities/media.entity';
import { MediaFolder } from '../../entities/media-folder.entity';
import { LocalStorageStrategy } from './strategies/local.strategy';
import { S3StorageStrategy } from './strategies/s3.strategy';
import { B2StorageStrategy } from './strategies/b2.strategy';
import { STORAGE_STRATEGY } from './strategies/storage.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, MediaFolder]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: memoryStorage(),
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB default
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaRepository,
    LocalStorageStrategy,
    S3StorageStrategy,
    B2StorageStrategy,
    {
      provide: STORAGE_STRATEGY,
      useFactory: (
        configService: ConfigService,
        localStrategy: LocalStorageStrategy,
        s3Strategy: S3StorageStrategy,
        b2Strategy: B2StorageStrategy,
      ) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'local');
        if (storageType === 's3') return s3Strategy;
        if (storageType === 'b2') return b2Strategy;
        return localStrategy;
      },
      inject: [ConfigService, LocalStorageStrategy, S3StorageStrategy, B2StorageStrategy],
    },
  ],
  exports: [MediaService, MediaRepository, STORAGE_STRATEGY],
})
export class MediaModule { }
