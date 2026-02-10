import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalProductPreview } from '../../entities/digital-product-preview.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { PreviewsController } from './previews.controller';
import { PreviewsRepository } from './previews.repository';
import { PreviewGenerationService } from './services/preview-generation.service';
import { WatermarkService } from './services/watermark.service';
import { PdfPreviewGeneratorService } from './services/pdf-preview-generator.service';
import { WebTemplatePreviewGeneratorService } from './services/web-template-preview-generator.service';
import { CodeTemplatePreviewGeneratorService } from './services/code-template-preview-generator.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DigitalProductPreview, DigitalProduct]),
    MediaModule,
  ],
  controllers: [PreviewsController],
  providers: [
    PreviewsRepository,
    PreviewGenerationService,
    WatermarkService,
    PdfPreviewGeneratorService,
    WebTemplatePreviewGeneratorService,
    CodeTemplatePreviewGeneratorService,
  ],
  exports: [PreviewsRepository, PreviewGenerationService],
})
export class PreviewsModule {}
