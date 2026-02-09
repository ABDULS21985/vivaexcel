import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';
import { SolutionDocumentsController } from './controllers/solution-documents.controller';
import { SolutionDocumentsUploadController } from './solution-documents-upload.controller';
import { SolutionDocumentsService } from './services/solution-documents.service';
import { SolutionDocumentsRepository } from './solution-documents.repository';
import { DocumentProcessorService } from './processing/document-processor.service';
import { DocumentUploadService } from './processing/document-upload.service';
import { SolutionDocument } from '../../entities/solution-document.entity';
import { DocumentBundle } from '../../entities/document-bundle.entity';
import { DocumentUpdate } from '../../entities/document-update.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { AiModule } from '../ai/ai.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolutionDocument,
      DocumentBundle,
      DocumentUpdate,
      DigitalProduct,
      DigitalProductFile,
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: memoryStorage(),
        limits: {
          fileSize: configService.get<number>('MAX_DOCUMENT_FILE_SIZE', 100 * 1024 * 1024), // 100MB default
        },
      }),
      inject: [ConfigService],
    }),
    AiModule,
    MediaModule,
  ],
  controllers: [SolutionDocumentsController, SolutionDocumentsUploadController],
  providers: [
    SolutionDocumentsService,
    SolutionDocumentsRepository,
    DocumentProcessorService,
    DocumentUploadService,
  ],
  exports: [
    SolutionDocumentsService,
    SolutionDocumentsRepository,
    DocumentUploadService,
  ],
})
export class SolutionDocumentsModule {}
