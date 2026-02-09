import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';
import { PresentationsController } from './controllers/presentations.controller';
import { PresentationsUploadController } from './presentations-upload.controller';
import { PresentationsService } from './services/presentations.service';
import { PresentationsRepository } from './presentations.repository';
import { PptxProcessorService } from './processing/pptx-processor.service';
import { ThumbnailGeneratorService } from './processing/thumbnail-generator.service';
import { PresentationUploadService } from './processing/presentation-upload.service';
import { Presentation } from '../../entities/presentation.entity';
import { SlidePreview } from '../../entities/slide-preview.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { AiModule } from '../ai/ai.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Presentation, SlidePreview, DigitalProduct, DigitalProductFile]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: memoryStorage(),
        limits: {
          fileSize: configService.get<number>('MAX_PRESENTATION_FILE_SIZE', 200 * 1024 * 1024), // 200MB default
        },
      }),
      inject: [ConfigService],
    }),
    AiModule,
    MediaModule,
  ],
  controllers: [PresentationsController, PresentationsUploadController],
  providers: [
    PresentationsService,
    PresentationsRepository,
    PptxProcessorService,
    ThumbnailGeneratorService,
    PresentationUploadService,
  ],
  exports: [
    PresentationsService,
    PresentationsRepository,
    PresentationUploadService,
  ],
})
export class PresentationsModule {}
